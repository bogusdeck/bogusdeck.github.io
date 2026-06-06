(function (global) {
    'use strict';

    const DEFAULTS = {
        target: null,
        mirrorX: true,
        maxNumHands: 1,
        modelComplexity: 1,
        shootCooldown: 400,
        flashDuration: 220,
        camera: {
            width: 640,
            height: 480
        },
        positionSmoothing: 0.35,
        fastMotionSmoothing: 0.6,
        motionBoostThreshold: 0.035,
        jitterDeadzone: 0.003,
        lostHandHoldMs: 120,
        thumbArmThreshold: -0.01,
        thumbFireThreshold: 0.018,
        thumbRearmThreshold: 0.002,
        thumbCloseThreshold: 0.18
    };

    class HandTrackingController {
        constructor(options) {
            this.options = mergeOptions(DEFAULTS, options || {});
            this.target = resolveTarget(this.options.target);
            if (!this.target) {
                throw new Error('HandTracking: target element was not found.');
            }

            this.hands = null;
            this.camera = null;
            this.video = null;
            this.ui = null;
            this.overlayCanvas = null;
            this.overlayCtx = null;
            this.previewVideo = null;
            this.previewCanvas = null;
            this.previewCtx = null;
            this.toggleButton = null;
            this.handIndicator = null;
            this.flashLabel = null;
            this.resizeObserver = null;
            this.enabled = false;
            this.lastShotAt = 0;
            this.lastHandSeenAt = 0;
            this.thumbArmed = false;
            this.hasHand = false;
            this.currentPoint = null;
            this.smoothedIndexPoint = null;

            this.handleResults = this.handleResults.bind(this);
            this.handleResize = this.handleResize.bind(this);
            this.toggle = this.toggle.bind(this);

            this.ensureContainerPositioning();
            this.buildUi();
            this.syncOverlaySize();
        }

        ensureContainerPositioning() {
            const computed = global.getComputedStyle(this.target);
            if (computed.position === 'static') {
                this.target.style.position = 'relative';
            }
        }

        buildUi() {
            const ui = document.createElement('div');
            ui.className = 'hand-tracking-ui';

            const overlayCanvas = document.createElement('canvas');
            overlayCanvas.className = 'hand-tracking-overlay';

            const controls = document.createElement('div');
            controls.className = 'hand-tracking-controls';

            const toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.className = 'boxxy headingfont text-white w-48 md:w-auto px-6 py-2 text-[10px] md:text-[12px] text-center justify-center hand-tracking-toggle';
            toggleButton.textContent = 'HAND ON';
            toggleButton.addEventListener('click', this.toggle);

            const previewVideo = document.createElement('video');
            previewVideo.className = 'hand-tracking-preview';
            previewVideo.autoplay = true;
            previewVideo.muted = true;
            previewVideo.playsInline = true;

            const previewCanvas = document.createElement('canvas');
            previewCanvas.className = 'hand-tracking-preview-overlay';

            const previewWrap = document.createElement('div');
            previewWrap.className = 'hand-tracking-preview-wrap';
            previewWrap.appendChild(previewVideo);
            previewWrap.appendChild(previewCanvas);

            const flashLabel = document.createElement('div');
            flashLabel.className = 'hand-tracking-fire-flash';
            flashLabel.textContent = 'FIRE 🔫';

            controls.appendChild(previewWrap);
            ui.appendChild(overlayCanvas);
            ui.appendChild(controls);
            ui.appendChild(flashLabel);
            this.target.appendChild(ui);

            const startOverlay = this.target.querySelector('#game-start-overlay');
            if (startOverlay) {
                const btnContainer = startOverlay.querySelector('.flex') || startOverlay;
                btnContainer.appendChild(toggleButton);
            } else {
                controls.appendChild(toggleButton);
            }

            const shotBox = this.target.querySelector('.shot-box');
            if (shotBox && shotBox.parentNode) {
                const handIndicator = document.createElement('div');
                handIndicator.className = 'boxxy-green hand-tracking-indicator hidden';
                handIndicator.innerHTML = '<div class="hand-indicator-emoji">✋</div><div class="hand-indicator-label">HAND</div>';
                shotBox.insertAdjacentElement('afterend', handIndicator);
                this.handIndicator = handIndicator;
            }

            this.ui = ui;
            this.overlayCanvas = overlayCanvas;
            this.overlayCtx = overlayCanvas.getContext('2d');
            this.previewVideo = previewVideo;
            this.previewCanvas = previewCanvas;
            this.previewCtx = previewCanvas.getContext('2d');
            this.toggleButton = toggleButton;
            this.flashLabel = flashLabel;

            if ('ResizeObserver' in global) {
                this.resizeObserver = new ResizeObserver(this.handleResize);
                this.resizeObserver.observe(this.target);
            } else {
                global.addEventListener('resize', this.handleResize);
            }
        }

        async initHands() {
            if (this.hands) {
                return;
            }

            if (typeof global.Hands !== 'function' || typeof global.Camera !== 'function') {
                throw new Error('HandTracking: MediaPipe Hands or Camera utils not loaded.');
            }

            this.hands = new global.Hands({
                locateFile: function (file) {
                    return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + file;
                }
            });

            this.hands.setOptions({
                maxNumHands: this.options.maxNumHands,
                modelComplexity: this.options.modelComplexity,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.6
            });

            this.hands.onResults(this.handleResults);
        }

        async enable() {
            if (this.enabled) {
                return;
            }

            await this.initHands();

            this.previewVideo.classList.add('is-live');

            this.camera = new global.Camera(this.previewVideo, {
                width: this.options.camera.width,
                height: this.options.camera.height,
                onFrame: async () => {
                    await this.hands.send({ image: this.previewVideo });
                }
            });

            await this.camera.start();
            this.enabled = true;
            this.toggleButton.textContent = 'HAND OFF';
            this.updateHandIndicator();
            this.dispatchCustomEvent('handtracking:toggle', { enabled: true });
        }

        disable() {
            if (!this.enabled && !this.camera) {
                return;
            }

            this.enabled = false;
            this.hasHand = false;
            this.thumbArmed = false;
            this.lastHandSeenAt = 0;
            this.currentPoint = null;
            this.smoothedIndexPoint = null;
            this.clearOverlay();
            this.clearPreviewOverlay();
            this.flashLabel.classList.remove('is-visible');
            this.previewVideo.classList.remove('is-live');

            if (this.camera && typeof this.camera.stop === 'function') {
                this.camera.stop();
            }
            this.camera = null;

            const stream = this.previewVideo.srcObject;
            if (stream && typeof stream.getTracks === 'function') {
                stream.getTracks().forEach((track) => track.stop());
            }
            this.previewVideo.srcObject = null;

            this.toggleButton.textContent = 'HAND ON';
            this.updateHandIndicator();
            this.dispatchCustomEvent('handtracking:toggle', { enabled: false });
        }

        async toggle() {
            try {
                if (this.enabled) {
                    this.disable();
                } else {
                    await this.enable();
                }
            } catch (error) {
                console.error(error);
                this.disable();
                this.dispatchCustomEvent('handtracking:error', { message: error.message });
            }
        }

        destroy() {
            this.disable();

            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            } else {
                global.removeEventListener('resize', this.handleResize);
            }

            if (this.toggleButton) {
                this.toggleButton.removeEventListener('click', this.toggle);
            }

            if (this.ui && this.ui.parentNode) {
                this.ui.parentNode.removeChild(this.ui);
            }
        }

        updateHandIndicator() {
            if (!this.handIndicator) {
                return;
            }

            this.handIndicator.classList.toggle('hidden', !this.enabled);
        }

        handleResize() {
            this.syncOverlaySize();
            if (this.currentPoint) {
                this.drawCrosshair(this.currentPoint.x, this.currentPoint.y);
            }
        }

        syncOverlaySize() {
            const rect = this.target.getBoundingClientRect();
            const dpr = global.devicePixelRatio || 1;

            this.overlayCanvas.width = Math.max(1, Math.round(rect.width * dpr));
            this.overlayCanvas.height = Math.max(1, Math.round(rect.height * dpr));
            this.overlayCanvas.style.width = rect.width + 'px';
            this.overlayCanvas.style.height = rect.height + 'px';
            this.overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const previewRect = this.previewVideo.getBoundingClientRect();
            this.previewCanvas.width = Math.max(1, Math.round(previewRect.width * dpr));
            this.previewCanvas.height = Math.max(1, Math.round(previewRect.height * dpr));
            this.previewCanvas.style.width = previewRect.width + 'px';
            this.previewCanvas.style.height = previewRect.height + 'px';
            this.previewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        handleResults(results) {
            if (!this.enabled) {
                return;
            }

            const landmarks = results && results.multiHandLandmarks && results.multiHandLandmarks[0];
            if (!landmarks) {
                const now = Date.now();
                if (this.currentPoint && (now - this.lastHandSeenAt) <= this.options.lostHandHoldMs) {
                    return;
                }
                this.hasHand = false;
                this.thumbArmed = false;
                this.lastHandSeenAt = 0;
                this.currentPoint = null;
                this.smoothedIndexPoint = null;
                this.clearOverlay();
                this.clearPreviewOverlay();
                return;
            }

            this.hasHand = true;
            this.lastHandSeenAt = Date.now();
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            const thumbIp = landmarks[3];
            const rawIndexPoint = this.getNormalizedIndexPoint(indexTip);
            const smoothedIndexPoint = this.smoothIndexPoint(rawIndexPoint);
            const point = this.mapNormalizedPointToTarget(smoothedIndexPoint);

            this.currentPoint = point;
            this.drawCrosshair(point.x, point.y);
            this.drawPreviewMarker(smoothedIndexPoint);
            this.dispatchMove(point);
            this.detectTrigger(thumbTip, thumbIp, point);
        }

        getNormalizedIndexPoint(landmark) {
            return {
                x: clamp(landmark.x, 0, 1),
                y: clamp(landmark.y, 0, 1)
            };
        }

        smoothIndexPoint(rawPoint) {
            if (!this.smoothedIndexPoint) {
                this.smoothedIndexPoint = { x: rawPoint.x, y: rawPoint.y };
                return this.smoothedIndexPoint;
            }

            const deltaX = rawPoint.x - this.smoothedIndexPoint.x;
            const deltaY = rawPoint.y - this.smoothedIndexPoint.y;
            const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

            if (distance < this.options.jitterDeadzone) {
                return this.smoothedIndexPoint;
            }

            const alpha = distance > this.options.motionBoostThreshold
                ? this.options.fastMotionSmoothing
                : this.options.positionSmoothing;

            this.smoothedIndexPoint = {
                x: this.smoothedIndexPoint.x + (deltaX * alpha),
                y: this.smoothedIndexPoint.y + (deltaY * alpha)
            };

            return this.smoothedIndexPoint;
        }

        mapNormalizedPointToTarget(normalizedPoint) {
            const rect = this.target.getBoundingClientRect();
            const normalizedX = this.options.mirrorX ? (1 - normalizedPoint.x) : normalizedPoint.x;
            const normalizedY = normalizedPoint.y;

            const clampedX = clamp(normalizedX, 0, 1);
            const clampedY = clamp(normalizedY, 0, 1);

            return {
                normalizedX: clampedX,
                normalizedY: clampedY,
                x: clampedX * rect.width,
                y: clampedY * rect.height,
                clientX: rect.left + (clampedX * rect.width),
                clientY: rect.top + (clampedY * rect.height)
            };
        }

        detectTrigger(thumbTip, thumbIp, point) {
            const thumbDrop = thumbTip.y - thumbIp.y;
            const thumbDistance = distance2d(thumbTip, thumbIp);
            const thumbRaised = thumbDrop < this.options.thumbArmThreshold;
            const thumbDown = thumbDrop > this.options.thumbFireThreshold;
            const thumbCloseEnough = thumbDistance < this.options.thumbCloseThreshold;

            if (thumbRaised) {
                this.thumbArmed = true;
            }

            if (thumbDrop <= this.options.thumbRearmThreshold) {
                this.thumbArmed = true;
            }

            const now = Date.now();
            if (!this.thumbArmed || !thumbDown || !thumbCloseEnough || (now - this.lastShotAt) < this.options.shootCooldown) {
                return;
            }

            this.thumbArmed = false;
            this.lastShotAt = now;
            this.showFireFlash();
            this.dispatchClick(point);
            this.dispatchCustomEvent('handtracking:fire', {
                x: point.x,
                y: point.y,
                normalizedX: point.normalizedX,
                normalizedY: point.normalizedY,
                thumbDrop: thumbDrop,
                thumbDistance: thumbDistance
            });
        }

        dispatchMove(point) {
            const target = this.pickDispatchTarget(point.clientX, point.clientY);
            const eventInit = buildMouseEventInit(point, 0, 0);
            target.dispatchEvent(new MouseEvent('mousemove', eventInit));
            this.dispatchCustomEvent('handtracking:move', {
                x: point.x,
                y: point.y,
                normalizedX: point.normalizedX,
                normalizedY: point.normalizedY
            });
        }

        dispatchClick(point) {
            const target = this.pickDispatchTarget(point.clientX, point.clientY);
            target.dispatchEvent(new MouseEvent('mousedown', buildMouseEventInit(point, 0, 1)));
            target.dispatchEvent(new MouseEvent('mouseup', buildMouseEventInit(point, 0, 0)));
            target.dispatchEvent(new MouseEvent('click', buildMouseEventInit(point, 0, 0)));
        }

        pickDispatchTarget(clientX, clientY) {
            const elements = typeof document.elementsFromPoint === 'function'
                ? document.elementsFromPoint(clientX, clientY)
                : [document.elementFromPoint(clientX, clientY)];

            for (let index = 0; index < elements.length; index += 1) {
                const element = elements[index];
                if (!element) {
                    continue;
                }
                if (element.closest('.hand-tracking-ui')) {
                    continue;
                }
                if (element === this.target || this.target.contains(element)) {
                    return element;
                }
            }

            return this.target;
        }

        drawCrosshair(x, y) {
            const ctx = this.overlayCtx;
            const width = this.overlayCanvas.width;
            const height = this.overlayCanvas.height;
            const dpr = global.devicePixelRatio || 1;

            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.scale(1 / dpr, 1 / dpr);

            const px = x * dpr;
            const py = y * dpr;
            const radius = 14;
            const arm = 9;

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.moveTo(px - radius - arm, py);
            ctx.lineTo(px - radius + 2, py);
            ctx.moveTo(px + radius - 2, py);
            ctx.lineTo(px + radius + arm, py);
            ctx.moveTo(px, py - radius - arm);
            ctx.lineTo(px, py - radius + 2);
            ctx.moveTo(px, py + radius - 2);
            ctx.lineTo(px, py + radius + arm);
            ctx.stroke();

            ctx.fillStyle = '#ff3b3b';
            ctx.fillRect(px - 2, py - 2, 4, 4);
            ctx.restore();
        }

        clearOverlay() {
            this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        }

        clearPreviewOverlay() {
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        }

        drawPreviewMarker(normalizedPoint) {
            const ctx = this.previewCtx;
            const dpr = global.devicePixelRatio || 1;
            const width = this.previewCanvas.width;
            const height = this.previewCanvas.height;

            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.scale(1 / dpr, 1 / dpr);

            const previewX = this.options.mirrorX ? (1 - normalizedPoint.x) : normalizedPoint.x;
            const x = clamp(previewX, 0, 1) * width;
            const y = clamp(normalizedPoint.y, 0, 1) * height;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ff2a2a';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            ctx.restore();
        }

        showFireFlash() {
            this.flashLabel.classList.remove('is-visible');
            void this.flashLabel.offsetWidth;
            this.flashLabel.classList.add('is-visible');

            global.clearTimeout(this.flashTimeout);
            this.flashTimeout = global.setTimeout(() => {
                this.flashLabel.classList.remove('is-visible');
            }, this.options.flashDuration);
        }

        dispatchCustomEvent(name, detail) {
            this.target.dispatchEvent(new CustomEvent(name, {
                bubbles: true,
                detail: detail
            }));
        }
    }

    function buildMouseEventInit(point, button, buttons) {
        return {
            bubbles: true,
            cancelable: true,
            clientX: point.clientX,
            clientY: point.clientY,
            screenX: point.clientX,
            screenY: point.clientY,
            button: button,
            buttons: buttons,
            composed: true,
            view: global
        };
    }

    function resolveTarget(target) {
        if (!target) {
            return null;
        }
        if (typeof target === 'string') {
            return document.querySelector(target);
        }
        return target;
    }

    function mergeOptions(base, overrides) {
        return {
            ...base,
            ...overrides,
            camera: {
                ...base.camera,
                ...(overrides && overrides.camera ? overrides.camera : {})
            }
        };
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function distance2d(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    global.initHandTracking = function initHandTracking(options) {
        return new HandTrackingController(options);
    };
}(window));

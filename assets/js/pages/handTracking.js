(function (global) {
    'use strict';

    const DEFAULTS = {
        target: null,
        mirrorX: true,
        maxNumHands: 1,
        modelComplexity: 0,
        shootCooldown: 400,
        flashDuration: 220,
        lowPowerMode: null,
        camera: {
            width: 480,
            height: 360
        },
        positionSmoothing: 0.18,
        fastMotionSmoothing: 0.48,
        motionBoostThreshold: 0.055,
        jitterDeadzone: 0.010,
        microJitterDeadzone: 0.006,
        snapDistance: 0.18,
        lostHandHoldMs: 120,
        triggerConfirmFrames: 2,
        triggerMinMovement: 0.008,
        stationaryFireBlockMs: 180,
        freshPointMaxAgeMs: 100,
        previewCalibration: {
            x: 0,
            y: -0.018
        },
        thumbArmThreshold: -0.01,
        thumbFireThreshold: 0.014,
        thumbRearmThreshold: 0.002,
        thumbCloseThreshold: 0.22,
        thumbFireTravelThreshold: 0.035
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
            this.previewFrame = null;
            this.overlayToggleButton = null;
            this.handToggleButton = null;
            this.flashLabel = null;
            this.visibilityObserver = null;
            this.resizeObserver = null;
            this.enabled = false;
            this.lastShotAt = 0;
            this.lastHandSeenAt = 0;
            this.lastPointUpdatedAt = 0;
            this.lastMotionAt = 0;
            this.thumbArmed = false;
            this.thumbDownFrames = 0;
            this.thumbArmY = null;
            this.hasHand = false;
            this.currentPoint = null;
            this.smoothedIndexPoint = null;
            this.frameRequestPending = false;
            this.lowPowerMode = typeof this.options.lowPowerMode === 'boolean'
                ? this.options.lowPowerMode
                : detectLowPowerMode(global);

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

            const overlayToggleButton = document.createElement('button');
            overlayToggleButton.type = 'button';
            overlayToggleButton.className = 'boxxy headingfont text-white w-48 md:w-auto px-6 py-2 text-[10px] md:text-[12px] text-center justify-center hand-tracking-overlay-toggle';
            overlayToggleButton.textContent = 'HAND ON';
            overlayToggleButton.addEventListener('click', this.toggle);

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

            const previewFrame = document.createElement('div');
            previewFrame.className = 'boxxy hand-tracking-preview-frame';
            previewFrame.appendChild(previewWrap);

            const flashLabel = document.createElement('div');
            flashLabel.className = 'hand-tracking-fire-flash';
            flashLabel.textContent = 'FIRE 🔫';

            controls.appendChild(previewFrame);
            ui.appendChild(overlayCanvas);
            ui.appendChild(controls);
            ui.appendChild(flashLabel);
            this.target.appendChild(ui);

            const startOverlay = this.target.querySelector('#game-start-overlay');
            if (startOverlay) {
                const btnContainer = startOverlay.querySelector('.flex') || startOverlay;
                btnContainer.appendChild(overlayToggleButton);
                this.overlayToggleButton = overlayToggleButton;
            }

            const shotBox = this.target.querySelector('.shot-box');
            if (shotBox && shotBox.parentNode) {
                const handToggleButton = document.createElement('button');
                handToggleButton.type = 'button';
                handToggleButton.className = 'boxxy-green hand-tracking-hud-toggle';
                handToggleButton.innerHTML = '<div class="hand-indicator-emoji">✋</div><div class="hand-indicator-label">HAND</div>';
                handToggleButton.addEventListener('click', this.toggle);
                shotBox.insertAdjacentElement('afterend', handToggleButton);
                this.handToggleButton = handToggleButton;
            }

            this.ui = ui;
            this.overlayCanvas = overlayCanvas;
            this.overlayCtx = overlayCanvas.getContext('2d');
            this.previewVideo = previewVideo;
            this.previewCanvas = previewCanvas;
            this.previewCtx = previewCanvas.getContext('2d');
            this.previewFrame = previewFrame;
            this.flashLabel = flashLabel;
            this.setupVisibilityObserver();
            this.updateToggleSurfaces();

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
            const cameraOptions = this.lowPowerMode
                ? { width: 320, height: 240 }
                : this.options.camera;

            this.previewVideo.classList.add('is-live');

            this.camera = new global.Camera(this.previewVideo, {
                width: cameraOptions.width,
                height: cameraOptions.height,
                onFrame: async () => {
                    if (this.frameRequestPending) {
                        return;
                    }

                    this.frameRequestPending = true;
                    try {
                        await this.hands.send({ image: this.previewVideo });
                    } finally {
                        this.frameRequestPending = false;
                    }
                }
            });

            await this.camera.start();
            this.enabled = true;
            this.previewFrame.classList.add('is-live');
            this.updateToggleSurfaces();
            this.dispatchCustomEvent('handtracking:toggle', { enabled: true });
        }

        disable() {
            if (!this.enabled && !this.camera) {
                return;
            }

            this.enabled = false;
            this.hasHand = false;
            this.thumbArmed = false;
            this.thumbDownFrames = 0;
            this.thumbArmY = null;
            this.lastHandSeenAt = 0;
            this.lastPointUpdatedAt = 0;
            this.lastMotionAt = 0;
            this.currentPoint = null;
            this.smoothedIndexPoint = null;
            this.frameRequestPending = false;
            this.setTrackedCursorVisible(false);
            this.clearOverlay();
            this.clearPreviewOverlay();
            this.flashLabel.classList.remove('is-visible');
            this.previewVideo.classList.remove('is-live');
            this.previewFrame.classList.remove('is-live');

            if (this.camera && typeof this.camera.stop === 'function') {
                this.camera.stop();
            }
            this.camera = null;

            const stream = this.previewVideo.srcObject;
            if (stream && typeof stream.getTracks === 'function') {
                stream.getTracks().forEach((track) => track.stop());
            }
            this.previewVideo.srcObject = null;

            this.updateToggleSurfaces();
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

            if (this.visibilityObserver) {
                this.visibilityObserver.disconnect();
                this.visibilityObserver = null;
            }

            if (this.overlayToggleButton && this.overlayToggleButton.parentNode) {
                this.overlayToggleButton.removeEventListener('click', this.toggle);
                this.overlayToggleButton.parentNode.removeChild(this.overlayToggleButton);
            }

            if (this.handToggleButton) {
                this.handToggleButton.removeEventListener('click', this.toggle);
                if (this.handToggleButton.parentNode) {
                    this.handToggleButton.parentNode.removeChild(this.handToggleButton);
                }
            }

            if (this.ui && this.ui.parentNode) {
                this.ui.parentNode.removeChild(this.ui);
            }
        }

        setupVisibilityObserver() {
            if (!('MutationObserver' in global)) {
                return;
            }

            const startOverlay = this.target.querySelector('#game-start-overlay');
            const hud = this.target.querySelector('.hud-container');
            const formSection = this.target.querySelector('#form-section');
            const observer = new MutationObserver(() => {
                this.updateToggleSurfaces();
            });

            [startOverlay, hud, formSection].forEach((node) => {
                if (node) {
                    observer.observe(node, { attributes: true, attributeFilter: ['class'] });
                }
            });

            this.visibilityObserver = observer;
        }

        updateToggleSurfaces() {
            const startOverlay = this.target.querySelector('#game-start-overlay');
            const hud = this.target.querySelector('.hud-container');
            const formSection = this.target.querySelector('#form-section');
            const overlayVisible = startOverlay ? !startOverlay.classList.contains('hidden') : false;
            const hudVisible = hud ? !hud.classList.contains('hidden') : false;
            const formVisible = formSection ? !formSection.classList.contains('hidden') : false;
            const playing = hudVisible && !overlayVisible && !formVisible;

            if (this.overlayToggleButton) {
                this.overlayToggleButton.classList.toggle('hidden', !overlayVisible);
                this.overlayToggleButton.textContent = this.enabled ? 'HAND OFF' : 'HAND ON';
            }

            if (this.handToggleButton) {
                this.handToggleButton.classList.toggle('hidden', !playing);
                this.handToggleButton.classList.toggle('is-active', this.enabled);
                this.handToggleButton.setAttribute('aria-pressed', this.enabled ? 'true' : 'false');
                this.handToggleButton.innerHTML = this.enabled
                    ? '<div class="hand-indicator-emoji">✋</div><div class="hand-indicator-label">OFF</div>'
                    : '<div class="hand-indicator-emoji">✋</div><div class="hand-indicator-label">HAND</div>';
            }
        }

        handleResize() {
            this.syncOverlaySize();
            if (this.currentPoint) {
                this.drawCrosshair(this.currentPoint.x, this.currentPoint.y);
            }
        }

        syncOverlaySize() {
            const rect = this.target.getBoundingClientRect();
            const dpr = Math.min(global.devicePixelRatio || 1, this.lowPowerMode ? 1 : 1.5);

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
                this.thumbDownFrames = 0;
                this.thumbArmY = null;
                this.lastHandSeenAt = 0;
                this.lastPointUpdatedAt = 0;
                this.currentPoint = null;
                this.smoothedIndexPoint = null;
                this.setTrackedCursorVisible(false);
                this.clearOverlay();
                this.clearPreviewOverlay();
                return;
            }

            this.hasHand = true;
            this.lastHandSeenAt = Date.now();
            const indexTip = landmarks[8];
            const indexDip = landmarks[7];
            const thumbTip = landmarks[4];
            const thumbIp = landmarks[3];
            const rawIndexPoint = this.getNormalizedIndexPoint(indexTip);
            const previewIndexPoint = this.getProjectedIndexTip(indexTip, indexDip);
            this.trackMotion(rawIndexPoint);
            const smoothedIndexPoint = this.smoothIndexPoint(rawIndexPoint);
            const point = this.mapNormalizedPointToTarget(smoothedIndexPoint);

            this.currentPoint = point;
            this.lastPointUpdatedAt = Date.now();
            this.setTrackedCursorVisible(true);
            this.drawCrosshair(point.x, point.y);
            this.drawPreviewMarker(previewIndexPoint);
            this.dispatchMove(point);
            this.detectTrigger(thumbTip, thumbIp, point);
        }

        trackMotion(rawPoint) {
            const now = Date.now();
            if (!this.smoothedIndexPoint) {
                this.lastMotionAt = now;
                return;
            }

            const deltaX = rawPoint.x - this.smoothedIndexPoint.x;
            const deltaY = rawPoint.y - this.smoothedIndexPoint.y;
            if (Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) >= this.options.triggerMinMovement) {
                this.lastMotionAt = now;
            }
        }

        getNormalizedIndexPoint(landmark) {
            return {
                x: clamp(landmark.x, 0, 1),
                y: clamp(landmark.y, 0, 1)
            };
        }

        getProjectedIndexTip(indexTip, indexDip) {
            const extension = 0.35;
            return {
                x: clamp(
                    indexTip.x + ((indexTip.x - indexDip.x) * extension) + this.options.previewCalibration.x,
                    0,
                    1
                ),
                y: clamp(
                    indexTip.y + ((indexTip.y - indexDip.y) * extension) + this.options.previewCalibration.y,
                    0,
                    1
                )
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

            if (distance < this.options.microJitterDeadzone) {
                return this.smoothedIndexPoint;
            }

            if (distance > this.options.snapDistance) {
                this.smoothedIndexPoint = { x: rawPoint.x, y: rawPoint.y };
                return this.smoothedIndexPoint;
            }

            const alpha = distance > this.options.motionBoostThreshold
                ? this.options.fastMotionSmoothing
                : this.options.positionSmoothing * clamp(distance / this.options.motionBoostThreshold, 0.35, 1);

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
            const thumbTravelDown = this.thumbArmY === null
                ? 0
                : thumbTip.y - this.thumbArmY;
            const thumbMovedDown = thumbTravelDown > this.options.thumbFireTravelThreshold;

            if (thumbRaised) {
                this.thumbArmed = true;
                this.thumbArmY = thumbTip.y;
            }

            if (thumbDrop <= this.options.thumbRearmThreshold) {
                this.thumbArmed = true;
                this.thumbDownFrames = 0;
                this.thumbArmY = thumbTip.y;
            }

            if ((thumbDown || thumbMovedDown) && thumbCloseEnough) {
                this.thumbDownFrames += 1;
            } else {
                this.thumbDownFrames = 0;
            }

            const now = Date.now();
            const stalePoint = (now - this.lastPointUpdatedAt) > this.options.freshPointMaxAgeMs;
            const stationaryGesture = (now - this.lastMotionAt) > this.options.stationaryFireBlockMs;
            if (!this.thumbArmed ||
                (!thumbDown && !thumbMovedDown) ||
                !thumbCloseEnough ||
                this.thumbDownFrames < this.options.triggerConfirmFrames ||
                stalePoint ||
                stationaryGesture ||
                (now - this.lastShotAt) < this.options.shootCooldown) {
                return;
            }

            this.thumbArmed = false;
            this.thumbDownFrames = 0;
            this.thumbArmY = null;
            this.lastShotAt = now;
            this.showFireFlash();
            this.dispatchClick(point);
            this.dispatchCustomEvent('handtracking:fire', {
                x: point.x,
                y: point.y,
                clientX: point.clientX,
                clientY: point.clientY,
                normalizedX: point.normalizedX,
                normalizedY: point.normalizedY,
                thumbDrop: thumbDrop,
                thumbDistance: thumbDistance,
                thumbTravelDown: thumbTravelDown
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
            const width = this.previewCanvas.width;
            const height = this.previewCanvas.height;
            const cssWidth = this.previewCanvas.clientWidth || 1;
            const cssHeight = this.previewCanvas.clientHeight || 1;
            const canvasScale = width / cssWidth;
            const videoWidth = this.previewVideo.videoWidth || cssWidth;
            const videoHeight = this.previewVideo.videoHeight || cssHeight;
            const coverScale = Math.max(cssWidth / videoWidth, cssHeight / videoHeight);
            const renderedWidth = videoWidth * coverScale;
            const renderedHeight = videoHeight * coverScale;
            const offsetX = (cssWidth - renderedWidth) / 2;
            const offsetY = (cssHeight - renderedHeight) / 2;
            const previewX = this.options.mirrorX ? (1 - normalizedPoint.x) : normalizedPoint.x;
            const x = (offsetX + (clamp(previewX, 0, 1) * renderedWidth)) * canvasScale;
            const y = (offsetY + (clamp(normalizedPoint.y, 0, 1) * renderedHeight)) * canvasScale;
            const radius = 3.5 * canvasScale;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, width, height);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ff2a2a';
            ctx.fill();
            ctx.lineWidth = 2 * canvasScale;
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

        setTrackedCursorVisible(visible) {
            this.target.classList.toggle('hand-tracking-cursor-hidden', visible);
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

    function detectLowPowerMode(globalObject) {
        const coarsePointer = globalObject.matchMedia && globalObject.matchMedia('(pointer: coarse)').matches;
        const reducedMotion = globalObject.matchMedia && globalObject.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const lowCpu = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
        const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
        return coarsePointer || reducedMotion || lowCpu || lowMemory;
    }

    global.initHandTracking = function initHandTracking(options) {
        return new HandTrackingController(options);
    };
}(window));

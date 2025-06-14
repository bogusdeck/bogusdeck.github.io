// Configuration loader
function loadConfig() {
  return fetch('/config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load configuration');
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error loading configuration:', error);
      return null;
    });
}

// Apply social media links
function applySocialLinks(config) {
  if (!config || !config.social) return;
  
  // Find all social links by their data attributes
  document.querySelectorAll('[data-social]').forEach(link => {
    const socialType = link.getAttribute('data-social');
    if (config.social[socialType]) {
      link.href = config.social[socialType];
    }
  });
}

// Apply project links
function applyProjectLinks(config) {
  if (!config || !config.projects) return;
  
  // Find all project links by their data attributes
  document.querySelectorAll('[data-project]').forEach(link => {
    const projectName = link.getAttribute('data-project');
    const linkType = link.getAttribute('data-link-type'); // github or live
    
    if (config.projects[projectName] && config.projects[projectName][linkType]) {
      link.href = config.projects[projectName][linkType];
    }
  });
}

// Apply tool links
function applyToolLinks(config) {
  if (!config || !config.tools) return;
  
  // Find all tool links by their data attributes
  document.querySelectorAll('[data-tool]').forEach(link => {
    const toolName = link.getAttribute('data-tool');
    if (config.tools[toolName]) {
      link.href = config.tools[toolName];
    }
  });
}

// Apply Notion notes links
function applyNotionLinks(config) {
  if (!config || !config.notionNotes) return;
  
  // Find all notion note links by their data attributes
  document.querySelectorAll('[data-notion-note]').forEach(link => {
    const noteType = link.getAttribute('data-notion-note');
    if (config.notionNotes[noteType]) {
      link.href = config.notionNotes[noteType];
    }
  });
}

// Apply GitHub stats configuration
function applyGitHubStats(config) {
  if (!config || !config.githubStats) return;
  
  // Set the GitHub username in the script.js file
  window.githubUsername = config.githubStats.username;
  window.defaultStars = config.githubStats.defaultStars;
  window.defaultContributions = config.githubStats.defaultContributions;
}

// Initialize configuration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadConfig().then(config => {
    if (config) {
      applySocialLinks(config);
      applyProjectLinks(config);
      applyToolLinks(config);
      applyNotionLinks(config);
      applyGitHubStats(config);
      
      // Dispatch an event to notify that config is loaded
      document.dispatchEvent(new CustomEvent('configLoaded', { detail: config }));
    }
  });
});

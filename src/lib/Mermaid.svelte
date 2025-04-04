<script>
    import { onMount } from 'svelte';
    import mermaid from 'mermaid';
  
    // The diagram definition to render
    export let definition = '';
    
    export let type = 'default';

    // Optional configuration
    export let config = {};
    
    let elementId = `mermaid-${Math.floor(Math.random() * 100000)}`;
    let containerDiv;
    let isRendered = false;
  
    onMount(async () => {
      try {
        // Initialize mermaid with default + custom config
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          ...config
        });
        
        // Use mermaid.render for better control
        const { svg } = await mermaid.render(elementId, definition);
        
        // Insert the SVG content
        if (containerDiv) {
          containerDiv.innerHTML = svg;
          isRendered = true;
          
          // Apply sizing to the rendered SVG
          const svgElement = containerDiv.querySelector('svg');
          if (svgElement) {
          // Apply sizing based on diagram type
          if (type === 'entity') {
            // Smaller size for entity diagrams
            svgElement.style.width = '20%';
            svgElement.style.maxWidth = '700px';
          } else if (type === 'sequence') {
            // Medium size for sequence diagrams
            svgElement.style.width = '90%';
            svgElement.style.maxWidth = '800px';
          } else {
            // Default/component size
            svgElement.style.width = '100%';
            svgElement.style.maxWidth = '900px';
          }
          
          // Common styling
          svgElement.style.height = 'auto';
          svgElement.style.margin = '0 auto';
          svgElement.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error);
    }
  });
  </script>
  
  <div class="mermaid-container" class:entity-container={type === 'entity'}>
    {#if !isRendered}
      <div class="loading">Loading diagram...</div>
    {/if}
    <div bind:this={containerDiv} class="mermaid-output"></div>
  </div>
  
  <style>
    .mermaid-container {
      width: 100%;
      display: flex;
      justify-content: center;
      position: relative;
      min-height: 100px;
    }
    
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-style: italic;
      color: #666;
    }
    
    .mermaid-output {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  </style>
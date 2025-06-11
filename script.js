document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const elements = document.querySelectorAll('.element');
    const propertiesForm = document.getElementById('properties-form');
    const deleteBtn = document.getElementById('delete-element');
    let selectedElement = null;

    // Initialize draggable elements
    elements.forEach(element => {
        element.addEventListener('dragstart', handleDragStart);
    });

    // Canvas event listeners
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('click', handleCanvasClick);

    // Properties form event listeners
    propertiesForm.addEventListener('change', updateElementProperties);
    deleteBtn.addEventListener('click', deleteSelectedElement);

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        
        // Create new element
        const element = createNewElement(type);
        
        // Position element at drop coordinates
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        element.style.position = 'absolute';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        canvas.appendChild(element);
        
        // Make the new element draggable within canvas
        makeDraggableInCanvas(element);
        
        // Hide empty message if it exists
        const emptyMessage = canvas.querySelector('.empty-message');
        if (emptyMessage) {
            emptyMessage.style.display = 'none';
        }
    }

    function createNewElement(type) {
        const element = document.createElement('div');
        element.className = 'canvas-element';
        element.dataset.type = type;
        element.draggable = true;

        switch (type) {
            case 'text':
                element.textContent = 'Double click to edit text';
                element.style.minWidth = '100px';
                break;
            case 'heading':
                element.innerHTML = '<h2>Heading</h2>';
                element.style.minWidth = '200px';
                break;
            case 'image':
                element.innerHTML = '<img src="https://via.placeholder.com/150" style="max-width: 100%;">';
                element.style.minWidth = '150px';
                break;
            case 'button':
                element.innerHTML = '<button style="padding: 10px 20px;">Button</button>';
                element.style.minWidth = '100px';
                break;
        }

        return element;
    }

    function makeDraggableInCanvas(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        element.addEventListener('mousedown', dragStart);
        element.addEventListener('dblclick', handleDoubleClick);
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            selectElement(element);
        });

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === element) {
                isDragging = true;
            }

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, element);
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }

    function handleDoubleClick(e) {
        if (e.target.tagName !== 'INPUT') {
            const text = prompt('Enter new text:', e.target.textContent);
            if (text !== null) {
                if (e.target.tagName === 'BUTTON') {
                    e.target.textContent = text;
                } else {
                    e.target.textContent = text;
                }
            }
        }
    }

    function selectElement(element) {
        // Deselect previously selected element
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }

        // Select new element
        selectedElement = element;
        element.classList.add('selected');

        // Show properties panel
        showProperties(element);
    }

    function handleCanvasClick(e) {
        if (e.target === canvas) {
            // Deselect when clicking canvas
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
                propertiesForm.style.display = 'none';
                document.querySelector('.no-selection').style.display = 'block';
            }
        }
    }

    function showProperties(element) {
        const form = document.getElementById('properties-form');
        const noSelection = document.querySelector('.no-selection');
        
        noSelection.style.display = 'none';
        form.style.display = 'block';

        // Update form fields based on element type
        const type = element.dataset.type;
        const propertyGroups = form.querySelectorAll('.property-group');

        propertyGroups.forEach(group => {
            const forTypes = group.dataset.for.split(',');
            if (forTypes.includes(type) || forTypes.includes('all')) {
                group.style.display = 'block';
            } else {
                group.style.display = 'none';
            }
        });

        // Set current values
        if (type === 'image') {
            const img = element.querySelector('img');
            document.getElementById('image-url').value = img.src;
        } else {
            document.getElementById('text-content').value = element.textContent;
        }

        document.getElementById('font-size').value = parseInt(getComputedStyle(element).fontSize);
        document.getElementById('text-color').value = rgb2hex(getComputedStyle(element).color);
        document.getElementById('bg-color').value = rgb2hex(getComputedStyle(element).backgroundColor);
        document.getElementById('padding').value = parseInt(getComputedStyle(element).padding);
    }    function updateElementProperties(e) {
        if (!selectedElement) return;

        const type = selectedElement.dataset.type;
        const target = type === 'button' ? selectedElement.querySelector('button') || selectedElement : selectedElement;
        
        switch (e.target.id) {
            // Layout Properties
            case 'width':
                target.style.width = `${e.target.value}px`;
                break;
            case 'height':
                target.style.height = `${e.target.value}px`;
                break;
            case 'padding-top':
            case 'padding-right':
            case 'padding-bottom':
            case 'padding-left':
                const side = e.target.id.split('-')[1];
                target.style[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] = `${e.target.value}px`;
                break;

            // Typography Properties
            case 'text-content':
                if (type === 'button') {
                    target.textContent = e.target.value;
                } else if (type === 'heading') {
                    target.querySelector('h2').textContent = e.target.value;
                } else {
                    target.textContent = e.target.value;
                }
                break;
            case 'font-family':
            case 'font-size':
            case 'font-weight':
            case 'text-transform':
            case 'letter-spacing':
            case 'line-height':
            case 'text-align':
                target.style[e.target.id] = e.target.id.includes('size') ? `${e.target.value}px` : e.target.value;
                break;

            // Style Properties
            case 'text-color':
                target.style.color = e.target.value;
                break;
            case 'bg-color':
                target.style.backgroundColor = e.target.value;
                break;
            case 'opacity':
                target.style.opacity = e.target.value;
                break;
            case 'border-radius':
                target.style.borderRadius = `${e.target.value}px`;
                break;
            case 'border-width':
                target.style.borderWidth = `${e.target.value}px`;
                break;
            case 'border-style':
                target.style.borderStyle = e.target.value;
                break;
            case 'border-color':
                target.style.borderColor = e.target.value;
                break;

            // Effects
            case 'shadow-x':
            case 'shadow-y':
            case 'shadow-blur':
            case 'shadow-spread':
            case 'shadow-color':
                updateBoxShadow(target);
                break;

            // Image Properties
            case 'image-url':
                if (type === 'image') {
                    const img = target.querySelector('img');
                    if (img) {
                        img.src = e.target.value;
                        img.onerror = () => {
                            alert('Failed to load image. Please check the URL.');
                            img.src = 'https://via.placeholder.com/150';
                        };
                    }
                }
                break;
            case 'object-fit':
                if (type === 'image') {
                    const img = target.querySelector('img');
                    if (img) {
                        img.style.objectFit = e.target.value;
                    }
                }
                break;
        }
    }

    function updateBoxShadow(element) {
        const x = document.getElementById('shadow-x').value || 0;
        const y = document.getElementById('shadow-y').value || 0;
        const blur = document.getElementById('shadow-blur').value || 0;
        const spread = document.getElementById('shadow-spread').value || 0;
        const color = document.getElementById('shadow-color').value || '#000000';
        
        element.style.boxShadow = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }

    function deleteSelectedElement() {
        if (selectedElement) {
            selectedElement.remove();
            selectedElement = null;
            propertiesForm.style.display = 'none';
            document.querySelector('.no-selection').style.display = 'block';

            // Show empty message if canvas is empty
            if (!canvas.querySelector('.canvas-element')) {
                canvas.querySelector('.empty-message').style.display = 'block';
            }
        }
    }

    // Utility function to convert RGB to HEX
    function rgb2hex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    function hex(x) {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }
});

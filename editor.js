// Add required font
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Add CSS file
const cssLink = document.createElement('link');
cssLink.href = 'editor.css';
cssLink.rel = 'stylesheet';
document.head.appendChild(cssLink);

// Add modal HTML to the page
const modalHTML = `
<div x-data="modalEditor" x-cloak>
    <!-- Modal Overlay -->
    <div x-show="isOpen" class="editor-modal-overlay" x-transition:enter="editor-fade-in"
        x-transition:enter-start="editor-fade-start" x-transition:enter-end="editor-fade-end"
        x-transition:leave="editor-fade-out" x-transition:leave-start="editor-fade-end"
        x-transition:leave-end="editor-fade-start">
        <!-- Modal Container -->
        <div class="editor-modal" x-transition:enter="editor-slide-in" x-transition:enter-start="editor-slide-start"
            x-transition:enter-end="editor-slide-end" x-transition:leave="editor-slide-out"
            x-transition:leave-start="editor-slide-end" x-transition:leave-end="editor-slide-start">
            <!-- Modal Header -->
            <div class="editor-modal-header">
                <div>
                    <template x-if="previousPaths.length > 0">
                        <div class="editor-breadcrumb">
                            <button @click="goBackToPrevious()" type="button">
                                Back
                            </button>
                        </div>
                    </template>
                    <h3 class="editor-modal-title" x-show="!isArray(formData)">
                        <span x-text="currentPath.split('.').pop()"></span>
                    </h3>
                </div>
                <button @click="cancelEdit()" class="editor-close-button">&times;</button>
            </div>

            <!-- Modal Body -->
            <div class="editor-modal-body">
                <!-- Error Messages -->
                <div x-show="Object.keys(errors).length > 0" class="editor-error">
                    <template x-for="(message, key) in errors" :key="key">
                        <p x-text="message"></p>
                    </template>
                    <p class="editor-error-hint">
                        If you're having trouble, try refreshing the page or contact support.
                    </p>
                </div>

                <!-- Simple Value -->
                <template x-if="!isComplexObject(formData) && !isArray(formData)">
                    <div class="editor-form-group">
                        <label class="editor-label">Value</label>
                        <template x-if="getInputType(formData) === 'textarea'">
                            <textarea x-model="formData" rows="6" class="editor-textarea"></textarea>
                        </template>
                        <template x-if="getInputType(formData) === 'html'">
                            <textarea x-model="formData" rows="10" class="editor-textarea editor-code"></textarea>
                        </template>
                        <template x-if="getInputType(formData) === 'checkbox'">
                            <div class="editor-checkbox-label">
                                <input type="checkbox" x-model="formData" class="editor-checkbox">
                                <span>Enabled</span>
                            </div>
                        </template>
                        <template x-if="getInputType(formData) === 'text' || getInputType(formData) === 'number'">
                            <input :type="getInputType(formData)" x-model="formData" class="editor-input">
                        </template>
                    </div>
                </template>

                <!-- Object Properties -->
                <template x-if="isComplexObject(formData)">
                    <div>
                        <template x-for="(value, key) in formData" :key="key">
                            <div class="editor-form-group">
                                <div class="editor-label">
                                    <span x-text="key"></span>
                                    <span class="editor-type" x-text="\`(\${typeof value})\`"></span>
                                </div>

                                <!-- Nested Object -->
                                <template x-if="isComplexObject(value)">
                                    <div>
                                        <button @click="openEditor(\`\${currentPath}.\${key}\`, true)"
                                            class="editor-edit-button">
                                            Edit Settings
                                        </button>
                                    </div>
                                </template>

                                <!-- Array -->
                                <template x-if="isArray(value)">
                                    <div>
                                        <button @click="openEditor(\`\${currentPath}.\${key}\`, true)"
                                            class="editor-edit-button">
                                            Edit Items
                                        </button>
                                    </div>
                                </template>

                                <!-- Text Input (Non-Image) -->
                                <template
                                    x-if="!isComplexObject(value) && !isArray(value) && getInputType(value) === 'text' && key !== 'image'">
                                    <input type="text" x-model="formData[key]" class="editor-input">
                                </template>

                                <!-- Image Input -->
                                <template x-if="!isComplexObject(value) && !isArray(value) && key === 'image'">
                                    <div>
                                        <div class="editor-image-upload">
                                            <input type="file" accept="image/*"
                                                @change="handleImageUpload($event, key)" :id="'image-upload-' + key">
                                            <label :for="'image-upload-' + key">Upload Image</label>
                                        </div>
                                        <div class="editor-image-preview" x-show="formData[key]">
                                            <img :src="formData[key]" alt="Preview">
                                        </div>
                                    </div>
                                </template>

                                <!-- Number Input -->
                                <template
                                    x-if="!isComplexObject(value) && !isArray(value) && getInputType(value) === 'number'">
                                    <input type="number" x-model.number="formData[key]" class="editor-input">
                                </template>

                                <!-- Checkbox -->
                                <template
                                    x-if="!isComplexObject(value) && !isArray(value) && getInputType(value) === 'checkbox'">
                                    <div class="editor-checkbox-label">
                                        <input type="checkbox" x-model="formData[key]" class="editor-checkbox">
                                        <span>Enabled</span>
                                    </div>
                                </template>

                                <!-- Textarea -->
                                <template
                                    x-if="!isComplexObject(value) && !isArray(value) && getInputType(value) === 'textarea'">
                                    <textarea x-model="formData[key]" rows="3" class="editor-textarea"></textarea>
                                </template>

                                <!-- HTML Input -->
                                <template
                                    x-if="!isComplexObject(value) && !isArray(value) && getInputType(value) === 'html'">
                                    <textarea x-model="formData[key]" rows="5" class="editor-textarea editor-code"></textarea>
                                </template>
                            </div>
                        </template>
                    </div>
                </template>

                <!-- Array Items -->
                <template x-if="isArray(formData)">
                    <div>
                        <div class="editor-form-group"
                            style="display: flex; justify-content: space-between; align-items: center;">
                            <h4>Items in this group (<span x-text="formData.length"></span>)</h4>
                            <div>
                                <button
                                    @click="if (formData.length > 0) { const template = formData[0]; const emptyItem = Object.fromEntries(Object.keys(template).map(key => [key, null])); formData.unshift(emptyItem); }"
                                    class="editor-edit-button" title="Add New Item at Beginning"
                                    :disabled="formData.length === 0">
                                    + Add to Beginning
                                </button>
                            </div>
                        </div>

                        <template x-for="(item, index) in formData" :key="index">
                            <div class="editor-array-card">
                                <div class="editor-array-header">
                                    <h5 class="editor-array-title">Item <span x-text="index + 1"></span></h5>
                                    <div class="editor-button-row">
                                        <button
                                            @click="if (index > 0) { const temp = formData[index]; formData[index] = formData[index-1]; formData[index-1] = temp; }"
                                            class="editor-edit-button" title="Move Up" :disabled="index === 0">
                                            Move Up
                                        </button>
                                        <button
                                            @click="if (index < formData.length - 1) { const temp = formData[index]; formData[index] = formData[index+1]; formData[index+1] = temp; }"
                                            class="editor-edit-button" title="Move Down"
                                            :disabled="index === formData.length - 1">
                                            Move Down
                                        </button>
                                        <button @click="formData.splice(index, 1)" class="editor-edit-button"
                                            title="Remove Item" :disabled="formData.length <= 1">
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <!-- Complex Object Item -->
                                <template x-if="isComplexObject(item)">
                                    <div>
                                        <template x-for="(propValue, propKey) in item" :key="propKey">
                                            <div class="editor-form-group">
                                                <div class="editor-label">
                                                    <span x-text="propKey"></span>
                                                    <span class="editor-type" x-text="\`(\${typeof propValue})\`"></span>
                                                </div>

                                                <!-- Nested Complex Objects -->
                                                <template x-if="isComplexObject(propValue) || isArray(propValue)">
                                                    <div>
                                                        <button
                                                            @click="openEditor(\`\${currentPath}[\${index}].\${propKey}\`, true)"
                                                            class="editor-edit-button">
                                                            Edit Settings
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Text Input (Non-Image) -->
                                                <template
                                                    x-if="!isComplexObject(propValue) && !isArray(propValue) && getInputType(propValue) === 'text' && propKey !== 'image'">
                                                    <input type="text" x-model="formData[index][propKey]"
                                                        class="editor-input">
                                                </template>

                                                <!-- Image Input -->
                                                <template
                                                    x-if="!isComplexObject(propValue) && !isArray(propValue) && propKey === 'image'">
                                                    <div>
                                                        <div class="editor-image-upload">
                                                            <input type="file" accept="image/*"
                                                                @change="handleImageUpload($event, \`\${index}.\${propKey}\`)"
                                                                :id="'image-upload-' + index + '-' + propKey">
                                                            <label
                                                                :for="'image-upload-' + index + '-' + propKey">Upload
                                                                Image</label>
                                                        </div>
                                                        <div class="editor-image-preview"
                                                            x-show="formData[index][propKey]">
                                                            <img :src="formData[index][propKey]" alt="Preview">
                                                        </div>
                                                    </div>
                                                </template>

                                                <!-- Number Input -->
                                                <template
                                                    x-if="!isComplexObject(propValue) && !isArray(propValue) && getInputType(propValue) === 'number'">
                                                    <input type="number" x-model.number="formData[index][propKey]"
                                                        class="editor-input">
                                                </template>

                                                <!-- Checkbox -->
                                                <template
                                                    x-if="!isComplexObject(propValue) && !isArray(propValue) && getInputType(propValue) === 'checkbox'">
                                                    <div class="editor-checkbox-label">
                                                        <input type="checkbox" x-model="formData[index][propKey]"
                                                            class="editor-checkbox">
                                                        <span>Enabled</span>
                                                    </div>
                                                </template>

                                                <!-- Textarea -->
                                                <template
                                                    x-if="!isComplexObject(propValue) && !isArray(propValue) && getInputType(propValue) === 'textarea'">
                                                    <textarea x-model="formData[index][propKey]" rows="2" class="editor-textarea"></textarea>
                                                </template>

                                                <!-- HTML Input -->
                                                <template
                                                    x-if="!isComplexObject(propValue) && !isArray(propValue) && getInputType(propValue) === 'html'">
                                                    <textarea x-model="formData[index][propKey]" rows="3" class="editor-textarea editor-code"></textarea>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </template>

                                <!-- Primitive Item -->
                                <template x-if="!isComplexObject(item) && !isArray(item)">
                                    <input :type="getInputType(item)" x-model="formData[index]" class="editor-input">
                                </template>
                            </div>
                        </template>

                        <!-- Add New Item Button -->
                        <div class="editor-button-row"
                            style="margin-top: 15px; display: flex; justify-content: flex-end;">
                            <button
                                @click="if (formData.length > 0) { const template = formData[0]; const emptyItem = Object.fromEntries(Object.keys(template).map(key => [key, null])); formData.push(emptyItem); }"
                                class="editor-edit-button" :disabled="formData.length === 0">
                                + Add to End
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Modal Footer -->
            <div class="editor-modal-footer">
                <button @click="cancelEdit()" class="editor-button editor-button-secondary">
                    Cancel
                </button>
                <button @click="saveChanges()" class="editor-button editor-button-primary">
                    Save
                </button>
            </div>
        </div>
    </div>
</div>`;

// Add modal HTML to the page
document.body.insertAdjacentHTML('beforeend', modalHTML);

// Initialize Alpine.js component
document.addEventListener('alpine:init', () => {
	Alpine.data('modalEditor', () => ({
		// Main data object that will be edited
		data: {},

		// Modal visibility state
		isOpen: false,

		// Current path being edited
		currentPath: '',

		// Stack of previous paths to enable "back" navigation
		previousPaths: [],

		// Form data for current edit
		formData: {},

		// Original data before editing (for cancel operation)
		originalData: {},

		// Hold error messages
		errors: {},

		// Loading state
		loading: true,

		/**
		 * Initialize the component
		 */
		init() {
			// Set dynamic data URL from template if available
			if (typeof dataUrl !== 'undefined') {
				window.dataUrl = dataUrl;
			}

			// Fetch the data from data.json
			this.fetchData();

			// Listen for clicks on elements with data-edit attribute
			this.$nextTick(() => {
				document.addEventListener('click', (e) => {
					const editElement = e.target.closest('[data-edit]');
					if (editElement) {
						const path = editElement.getAttribute('data-edit');
						this.openEditor(path);
					}
				});
			});
		},

		/**
		 * Fetch data
		 */
		async fetchData() {
			this.loading = true;

			try {
				// Use dynamic data URL from template if available
				const dataUrl = window.dataUrl || 'data.json';
				const response = await fetch(dataUrl);

				if (!response.ok) {
					throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
				}

				const data = await response.json();
				this.data = data;

				// Also set it as a global variable for other components to use
				window.siteData = data;

				// Dispatch event to notify that data is loaded
				window.dispatchEvent(
					new CustomEvent('data-loaded', {
						detail: {
							data
						}
					})
				);

				console.info('Data loaded from', dataUrl);
			} catch (error) {
				console.error('Error loading data:', error);
				this.errors.loading = 'Failed to load data. Please check the console for details.';

				// If we have a fallback in the global variable, use that
				if (window.siteData) {
					this.data = window.siteData;
				}
			} finally {
				this.loading = false;
			}
		},

		/**
		 * Open the editor for a specific data path
		 * @param {string} path - Dot notation path to data (e.g., 'hero.title')
		 * @param {boolean} addToPrevious - Whether to add to the previous paths stack
		 */
		openEditor(path, addToPrevious = false) {
			// If we should add the current path to the history before changing
			if (addToPrevious && this.currentPath) {
				this.previousPaths.push(this.currentPath);
			}

			this.currentPath = path;
			this.errors = {};

			// Get the target object from the provided path
			const targetData = this.getValueFromPath(this.data, path);

			// Exit if data not found
			if (targetData === undefined) {
				console.error(`Path "${path}" not found in data`);
				return;
			}

			// Clone the data to avoid direct modification
			this.originalData = JSON.parse(JSON.stringify(targetData));
			this.formData = JSON.parse(JSON.stringify(targetData));

			// Open the modal
			this.isOpen = true;
		},

		/**
		 * Go back to the previous path in the history
		 */
		goBackToPrevious() {
			if (this.previousPaths.length === 0) return;

			const previousPath = this.previousPaths.pop();
			this.openEditor(previousPath, false);
		},

		/**
		 * Extract value from a nested object using dot notation path
		 * @param {Object} obj - The object to extract from
		 * @param {string} path - Dot notation path (e.g., 'hero.title')
		 * @return {*} The value at the specified path
		 */
		getValueFromPath(obj, path) {
			// If path contains array notation like hero.items[1], parse it
			if (path.includes('[') && path.includes(']')) {
				return this.getValueFromArrayPath(obj, path);
			}

			const keys = path.split('.');
			let result = obj;

			for (const key of keys) {
				if (result === undefined || result === null) {
					return undefined;
				}
				result = result[key];
			}

			return result;
		},

		/**
		 * Handle paths with array notation like hero.items[1].title
		 * @param {Object} obj - The object to extract from
		 * @param {string} path - Path with array notation
		 * @return {*} The value at the specified path
		 */
		getValueFromArrayPath(obj, path) {
			// Parse path segments including array indices
			const segments = [];
			let currentSegment = '';
			let inArrayNotation = false;

			for (let i = 0; i < path.length; i++) {
				const char = path[i];

				if (char === '.' && !inArrayNotation) {
					segments.push(currentSegment);
					currentSegment = '';
				} else if (char === '[') {
					inArrayNotation = true;
					segments.push(currentSegment);
					currentSegment = '[';
				} else if (char === ']') {
					inArrayNotation = false;
					currentSegment += ']';
					segments.push(currentSegment);
					currentSegment = '';
				} else {
					currentSegment += char;
				}
			}

			if (currentSegment) {
				segments.push(currentSegment);
			}

			// Traverse the object using the path segments
			let result = obj;

			for (const segment of segments) {
				if (result === undefined || result === null) {
					return undefined;
				}

				if (segment.startsWith('[') && segment.endsWith(']')) {
					const index = parseInt(segment.slice(1, -1), 10);
					if (!Array.isArray(result) || isNaN(index)) {
						return undefined;
					}
					result = result[index];
				} else {
					result = result[segment];
				}
			}

			return result;
		},

		/**
		 * Set a value in the data object using a path
		 * @param {Object} obj - The object to modify
		 * @param {string} path - Dot notation path
		 * @param {*} value - The value to set
		 */
		setValueAtPath(obj, path, value) {
			// Handle array notation
			if (path.includes('[') && path.includes(']')) {
				this.setValueAtArrayPath(obj, path, value);
				return;
			}

			const keys = path.split('.');
			const lastKey = keys.pop();
			let current = obj;

			// Navigate to the parent of the target property
			for (const key of keys) {
				if (current[key] === undefined) {
					current[key] = {};
				}
				current = current[key];
			}

			// Set the value
			current[lastKey] = value;
		},

		/**
		 * Set a value in an object with array notation path
		 * @param {Object} obj - The object to modify
		 * @param {string} path - Path with array notation
		 * @param {*} value - The value to set
		 */
		setValueAtArrayPath(obj, path, value) {
			// Parse path segments including array indices
			const segments = [];
			let currentSegment = '';
			let inArrayNotation = false;

			for (let i = 0; i < path.length; i++) {
				const char = path[i];

				if (char === '.' && !inArrayNotation) {
					segments.push(currentSegment);
					currentSegment = '';
				} else if (char === '[') {
					inArrayNotation = true;
					segments.push(currentSegment);
					currentSegment = '[';
				} else if (char === ']') {
					inArrayNotation = false;
					currentSegment += ']';
					segments.push(currentSegment);
					currentSegment = '';
				} else {
					currentSegment += char;
				}
			}

			if (currentSegment) {
				segments.push(currentSegment);
			}

			// Remove empty segments
			const filteredSegments = segments.filter((segment) => segment !== '');

			// Navigate to the parent of the target property
			let current = obj;
			const lastSegment = filteredSegments.pop();

			for (const segment of filteredSegments) {
				if (segment.startsWith('[') && segment.endsWith(']')) {
					const index = parseInt(segment.slice(1, -1), 10);
					if (!Array.isArray(current)) {
						return;
					}
					if (current[index] === undefined) {
						current[index] = {};
					}
					current = current[index];
				} else {
					if (current[segment] === undefined) {
						current[segment] = {};
					}
					current = current[segment];
				}
			}

			// Set the value
			if (lastSegment.startsWith('[') && lastSegment.endsWith(']')) {
				const index = parseInt(lastSegment.slice(1, -1), 10);
				if (!Array.isArray(current)) {
					return;
				}
				current[index] = value;
			} else {
				current[lastSegment] = value;
			}
		},

		/**
		 * Get field type based on value
		 * @param {*} value - Value to check
		 * @return {string} Input type
		 */
		getInputType(value) {
			if (value === null || value === undefined) {
				return 'text';
			}

			const type = typeof value;

			switch (type) {
				case 'boolean':
					return 'checkbox';
				case 'number':
					return 'number';
				case 'string':
					if (value.startsWith('<') && value.endsWith('>')) {
						return 'html';
					}
					if (value.length > 100) {
						return 'textarea';
					}
					return 'text';
				default:
					return 'text';
			}
		},

		/**
		 * Check if a value is a complex object (not primitive)
		 * @param {*} value - Value to check
		 * @return {boolean} True if complex object
		 */
		isComplexObject(value) {
			return (
				typeof value === 'object' &&
				value !== null &&
				!Array.isArray(value) &&
				Object.keys(value).length > 0
			);
		},

		/**
		 * Check if a value is an array
		 * @param {*} value - Value to check
		 * @return {boolean} True if array
		 */
		isArray(value) {
			return Array.isArray(value);
		},

		/**
		 * Save changes to the data
		 */
		saveChanges() {
			try {
				// Update the main data object
				this.setValueAtPath(this.data, this.currentPath, this.formData);

				// Close the modal with a fade effect
				this.isOpen = false;

				// Save to API without showing loading indicator
				setTimeout(() => {
					// Save to API and update the page content
					this.saveToApiQuietly();
				}, 300); // Wait for fade transition to complete

				// Trigger a custom event for components to update
				window.dispatchEvent(
					new CustomEvent('data-updated', {
						detail: {
							path: this.currentPath,
							data: this.data
						}
					})
				);
			} catch (error) {
				console.error('Error saving changes:', error);
				this.errors.general = 'Error saving changes. Please try again.';
			}
		},

		/**
		 * Save to API without showing a loading indicator
		 */
		async saveToApiQuietly() {
			try {
				// POST the data to the API
				const response = await fetch('/api/save', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(this.data)
				});

				if (!response.ok) {
					throw new Error(`API responded with status: ${response.status}`);
				}

				// Update the page content for the edited element
				this.updatePageContent();
			} catch (error) {
				console.error('Error saving to API:', error);
				// Don't show an alert, just log to console
			}
		},

		/**
		 * Update the page content for the edited element
		 */
		async updatePageContent() {
			try {
				// Fetch the current page to get updated HTML
				const response = await fetch(window.location.href);
				if (!response.ok) {
					throw new Error(`Failed to fetch updated content: ${response.status}`);
				}

				const html = await response.text();
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');

				// Find the element with the matching data-edit attribute
				const selector = `[data-edit="${this.currentPath}"]`;
				const newElement = doc.querySelector(selector);
				const currentElement = document.querySelector(selector);

				// If we found both elements, replace the content
				if (newElement && currentElement) {
					// Replace the content
					currentElement.outerHTML = newElement.outerHTML;

					// Get the updated element
					const updatedElement = document.querySelector(selector);

					// Add highlight animation
					if (updatedElement) {
						this.addHighlightEffect(updatedElement);
					}
				}
			} catch (error) {
				console.error('Error updating page content:', error);
			}
		},

		/**
		 * Add a highlight effect to the updated element
		 * @param {HTMLElement} element - The element to highlight
		 */
		addHighlightEffect(element) {
			// Create a highlight effect
			const highlightEffect = document.createElement('div');
			highlightEffect.className = 'editor-highlight-effect';

			// Position the effect over the element
			const rect = element.getBoundingClientRect();
			highlightEffect.style.position = 'absolute';
			highlightEffect.style.top = `${window.scrollY + rect.top}px`;
			highlightEffect.style.left = `${window.scrollX + rect.left}px`;
			highlightEffect.style.width = `${rect.width}px`;
			highlightEffect.style.height = `${rect.height}px`;
			highlightEffect.style.backgroundColor = '#fcefc0';
			highlightEffect.style.opacity = '0';
			highlightEffect.style.zIndex = '50';
			highlightEffect.style.pointerEvents = 'none';

			// Add the effect to the body
			document.body.appendChild(highlightEffect);

			// Animate the effect
			setTimeout(() => {
				highlightEffect.style.transition = 'opacity 0.5s ease-in-out';
				highlightEffect.style.opacity = '0.6';

				setTimeout(() => {
					highlightEffect.style.opacity = '0';

					// Remove the effect after animation
					setTimeout(() => {
						document.body.removeChild(highlightEffect);
					}, 500);
				}, 1000);
			}, 100);
		},

		/**
		 * Cancel editing and close modal
		 */
		cancelEdit() {
			this.isOpen = false;
		},

		/**
		 * Create a deep copy of an object
		 * @param {Object} obj - Object to copy
		 * @return {Object} Deep copy
		 */
		deepCopy(obj) {
			// Handle null or undefined
			if (obj === null || obj === undefined) {
				return {};
			}

			// Create a deep copy
			return JSON.parse(JSON.stringify(obj));
		},

		/**
		 * Handle image upload and resize
		 */
		handleImageUpload(event, key) {
			const file = event.target.files[0];
			if (!file || !file.type.startsWith('image/')) return;

			const reader = new FileReader();

			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					// Create a canvas to resize the image
					const canvas = document.createElement('canvas');
					let width = img.width;
					let height = img.height;

					// Calculate new dimensions maintaining aspect ratio with max width of 750px
					if (width > 750) {
						const ratio = 750 / width;
						width = 750;
						height = Math.round(height * ratio);
					}

					canvas.width = width;
					canvas.height = height;

					// Draw the resized image on the canvas
					const ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, width, height);

					// Get the data URL from the canvas
					const resizedDataUrl = canvas.toDataURL(file.type);

					// Set the value in formData
					if (typeof key === 'string' && key.includes('.')) {
						// Handle nested arrays (e.g., "0.image")
						const [index, prop] = key.split('.');
						this.formData[index][prop] = resizedDataUrl;
					} else {
						// Handle regular keys
						this.formData[key] = resizedDataUrl;
					}
				};
				img.src = e.target.result;
			};

			reader.readAsDataURL(file);
		}
	}));
});

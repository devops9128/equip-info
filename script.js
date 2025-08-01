// Product Management Class - Local Storage Version
class ProductManager {
    constructor() {
        this.products = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        this.filteredProducts = [];
        this.renderCache = new Map();
        this.virtualScrollEnabled = false;
        this.visibleRange = { start: 0, end: 20 };
        this.itemHeight = 300; // Estimated product card height
        this.performanceMonitor = {
            renderTimes: [],
            lastCleanup: Date.now()
        };
        this.eventListeners = new Map(); // Store event listener references
        this.abortController = new AbortController(); // For cleaning up event listeners
        this.init();
    }
    
    // Debounce function - Optimize search performance
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) {
                    try {
                        func.apply(this, args);
                    } catch (error) {
                        console.error('Debounce function execution error:', error);
                    }
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                try {
                    func.apply(this, args);
                } catch (error) {
                    console.error('Debounce function immediate execution error:', error);
                }
            }
        };
    }
    
    // Throttle function - Optimize scroll performance
    throttle(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                try {
                    func.apply(context, args);
                } catch (error) {
                    console.error('Throttle function execution error:', error);
                }
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        try {
                            func.apply(context, args);
                        } catch (error) {
                            console.error('Throttle function delayed execution error:', error);
                        }
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    // Cache cleanup
    cleanupCache() {
        const now = Date.now();
        
        // Clean cache every 5 minutes
        if (now - this.performanceMonitor.lastCleanup > 300000) {
            // Clean render cache
            if (this.renderCache.size > 100) {
                const keysToDelete = Array.from(this.renderCache.keys()).slice(0, 50);
                keysToDelete.forEach(key => this.renderCache.delete(key));
            }
            
            // Clean product warranty cache
            this.products.forEach(product => {
                if (product._warrantyCache) {
                    delete product._warrantyCache;
                }
            });
            
            this.performanceMonitor.lastCleanup = now;
            console.log('Cache cleanup completed');
        } else if (this.renderCache.size > 200) {
            // Emergency cleanup
            const keysToDelete = Array.from(this.renderCache.keys()).slice(0, 100);
            keysToDelete.forEach(key => this.renderCache.delete(key));
        }
    }
    
    // Performance monitoring
    monitorPerformance(operation, duration) {
        this.performanceMonitor.renderTimes.push({
            operation,
            duration,
            timestamp: Date.now()
        });
        
        // Keep only the latest 100 records
        if (this.performanceMonitor.renderTimes.length > 100) {
            this.performanceMonitor.renderTimes.shift();
        }
        
        // Show warning if rendering takes too long
        if (duration > 100) {
            console.warn(`Performance warning: ${operation} took ${duration}ms`);
        }
    }
    
    // Get performance statistics
    getPerformanceStats() {
        const times = this.performanceMonitor.renderTimes;
        if (times.length === 0) return null;
        
        const durations = times.map(t => t.duration);
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const max = Math.max(...durations);
        const min = Math.min(...durations);
        
        return {
            average: Math.round(avg),
            maximum: max,
            minimum: min,
            samples: times.length,
            cacheSize: this.renderCache.size
        };
    }

    // Initialize application - Local storage version
    init() {
        const startTime = performance.now();
        
        // Use requestAnimationFrame for batch initialization
        requestAnimationFrame(() => {
            this.bindEvents();
            this.initWarrantyPresets();
            
            requestAnimationFrame(() => {
                this.initThemeSystem();
                
                requestAnimationFrame(() => {
                    // Load product data
                    this.products = this.loadProducts();
                    this.renderProducts();
                    this.updateStats();
                    
                    // Performance monitoring after initialization
                    const endTime = performance.now();
                    this.monitorPerformance('initialization', endTime - startTime);
                    
                    // Start periodic cache cleanup
                    setInterval(() => this.cleanupCache(), 60000); // Check every minute

                    // Scroll to top after page load
                    window.scrollTo(0, 0);
                });
            });
        });
    }
    
    // Initialize warranty preset buttons
    initWarrantyPresets() {
        const presetButtons = document.querySelectorAll('.warranty-preset');
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const months = parseInt(button.dataset.months);
                const warrantyField = document.getElementById('editWarrantyPeriod');
                warrantyField.value = months;
                
                // Trigger warranty information update
                const purchaseDateField = document.getElementById('editPurchaseDate');
                if (purchaseDateField.value) {
                    const mockProduct = {
                        purchaseDate: purchaseDateField.value,
                        warrantyPeriod: months
                    };
                    this.updateWarrantyInfo(mockProduct);
                }
                
                // Update button state
                presetButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    // Initialize theme system
    initThemeSystem() {
        // Load saved theme from local storage
        const savedTheme = localStorage.getItem('selectedTheme') || 'nature';
        this.applyTheme(savedTheme);
        
        // Set theme selector value
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = savedTheme;
            
            // Bind theme switching event
            themeSelect.addEventListener('change', (e) => {
                const selectedTheme = e.target.value;
                this.applyTheme(selectedTheme);
                localStorage.setItem('selectedTheme', selectedTheme);
                this.showNotification(`Switched to ${this.getThemeName(selectedTheme)} theme`, 'success');
            });
        }
    }
    
    // Apply theme
    applyTheme(theme) {
        const body = document.body;
        
        // Remove all theme classes
        body.removeAttribute('data-theme');
        
        // Apply new theme
        body.setAttribute('data-theme', theme);
        
        // Add theme switching animation
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }
    
    // Get theme name
    getThemeName(theme) {
        const themeNames = {
            'nature': 'Nature Green',
            'purple': 'Elegant Purple',
            'orange': 'Vibrant Orange',
            'pink': 'Warm Pink'
        };
        return themeNames[theme] || theme;
    }

    // Add event listener cleanup method
    addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, {
            ...options,
            signal: this.abortController.signal
        });
        
        // Store reference for manual cleanup (if needed)
        const key = `${element.tagName}-${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ element, event, handler });
    }

    // Clean up all event listeners
    cleanup() {
        this.abortController.abort();
        this.eventListeners.clear();
    }

    // Bind event listeners
    bindEvents() {
        // Form submission event
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProduct();
            });
        }

        // Reset edit form
        const editCancelBtn = document.getElementById('editCancelBtn');
        if (editCancelBtn) {
            editCancelBtn.addEventListener('click', () => {
                this.closeModal('editModal');
            });
        }

        // Search and filter events - Use debounce to optimize performance
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = this.debounce(() => {
                this.filterProducts();
            }, 300);
            
            searchInput.addEventListener('input', debouncedSearch);
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterProducts();
            });
        }

        // Import/export events
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('importFile').click();
            });
        }

        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                this.importData(e);
            });
        }

        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.confirmClearData();
            });
        }

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Virtual scroll events (if enabled)
        if (this.virtualScrollEnabled) {
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                const throttledScroll = this.throttle(() => {
                    this.updateVisibleRange();
                }, 16); // 60fps
                
                productGrid.addEventListener('scroll', throttledScroll);
            }
        }
    }

    // Clear all field errors
    clearAllFieldErrors() {
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(element => element.remove());
    }

    // Load product data from local storage
    loadProducts() {
        try {
            const data = localStorage.getItem('productData');
            if (data) {
                const products = JSON.parse(data);
                // Sort by creation time (newest first)
                return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            // Clear cache since data has been updated
            this.renderCache.clear();
            this.filterCache.clear();
            
            return [];
        } catch (error) {
            console.error('Failed to load product data from local storage:', error);
            return [];
        }
    }

    // Save product data to local storage
    saveProductsToStorage() {
        try {
            localStorage.setItem('productData', JSON.stringify(this.products));
            console.log('Product data saved successfully');
        } catch (error) {
            console.error('Failed to save product data to local storage:', error);
        }
    }

    // Save single product
    saveProduct(product) {
        try {
            // Find existing product index
            const existingIndex = this.products.findIndex(p => p.id === product.id);
            
            if (existingIndex !== -1) {
                // Update existing product
                this.products[existingIndex] = { ...this.products[existingIndex], ...product, updatedAt: new Date().toISOString() };
            } else {
                // Add new product to beginning
                this.products.unshift(product);
            }
            
            // Save to local storage
            this.saveProductsToStorage();
            console.log('Product saved successfully:', product.id);
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    }

    // Delete product
    deleteProduct(productId) {
        try {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProductsToStorage();
            console.log('Product deleted successfully:', productId);
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new product
    addProduct() {
        try {
            // Clear previous errors
            this.clearAllFieldErrors();
            
            const formData = this.getFormData('productForm');
            
            if (!this.validateProduct(formData)) {
                this.showNotification('Product information validation failed, please check the form.', 'error');
                return;
            }
            
            // Check duplicate product
            if (this.isDuplicateProduct(formData)) {
                this.showNotification('Similar product detected, please confirm if this is a duplicate', 'warning');
            }
            
            // Create product object
            const product = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save product
            this.saveProduct(product);
            
            // Clear cache
            this.clearCache();
            
            // Reset form
            document.getElementById('productForm').reset();
            
            // Re-render and update statistics
            this.renderProducts();
            this.updateStats();
            
            this.showNotification('Product added successfully!', 'success');
        } catch (error) {
            console.error('Failed to add product:', error);
            this.showNotification(`Failed to add product: ${error.message || 'Please try again'}`, 'error');
        }
    }

    // Get form data
    getFormData(formId) {
        const form = document.getElementById(formId);
        
        if (formId === 'editProductForm') {
            return {
                name: document.getElementById('editProductName').value || '',
                brand: document.getElementById('editBrand').value || '',
                model: document.getElementById('editModel').value || '',
                category: document.getElementById('editCategory').value || '',
                serialNumber: document.getElementById('editSerialNumber').value || '',
                purchaseDate: document.getElementById('editPurchaseDate').value || '',
                warrantyPeriod: parseInt(document.getElementById('editWarrantyPeriod').value) || 0,
                price: parseFloat(document.getElementById('editPrice').value) || 0,
                store: document.getElementById('editStore').value || '',
                notes: document.getElementById('editNotes').value || ''
            };
        } else {
            const formData = new FormData(form);
            return {
                name: formData.get('productName') || '',
                brand: formData.get('brand') || '',
                model: formData.get('model') || '',
                category: formData.get('category') || '',
                serialNumber: formData.get('serialNumber') || '',
                purchaseDate: formData.get('purchaseDate') || '',
                warrantyPeriod: parseInt(formData.get('warrantyPeriod')) || 0,
                price: parseFloat(formData.get('price')) || 0,
                store: formData.get('store') || '',
                notes: formData.get('notes') || ''
            };
        }
    }

    // Check duplicate product
    isDuplicateProduct(newProduct) {
        return this.products.some(existingProduct => {
            // Check name, brand, model for exact match
            const nameMatch = existingProduct.name.toLowerCase().trim() === newProduct.name.toLowerCase().trim();
            const brandMatch = (existingProduct.brand || '').toLowerCase().trim() === (newProduct.brand || '').toLowerCase().trim();
            const modelMatch = (existingProduct.model || '').toLowerCase().trim() === (newProduct.model || '').toLowerCase().trim();
            
            // If name, brand, model matches, then consider it as duplicate product
            return nameMatch && brandMatch && modelMatch;
        });
    }
    
    // Validate product data
    validateProduct(product, isEdit = false) {
        const errors = [];
        
        // Clear previous errors
        this.clearAllFieldErrors();
        
        if (!product.name || product.name.trim() === '') {
            errors.push({ field: isEdit ? 'editProductName' : 'productName', message: 'Product name cannot be empty' });
        }
        
        if (!product.purchaseDate) {
            errors.push({ field: isEdit ? 'editPurchaseDate' : 'purchaseDate', message: 'Purchase date cannot be empty' });
        } else {
            const purchaseDate = new Date(product.purchaseDate);
            const today = new Date();
            if (purchaseDate > today) {
                errors.push({ field: isEdit ? 'editPurchaseDate' : 'purchaseDate', message: 'Purchase date cannot be in the future' });
            }
        }
        
        if (product.warrantyPeriod < 0 || product.warrantyPeriod > 120) {
            errors.push({ field: isEdit ? 'editWarrantyPeriod' : 'warrantyPeriod', message: 'Warranty period should be between 0-120 months' });
        }
        
        if (product.price < 0) {
            errors.push({ field: isEdit ? 'editPrice' : 'price', message: 'Price cannot be negative' });
        }
        
        // Show errors
        errors.forEach(error => {
            this.showFieldError(error.field, error.message);
        });
        
        return errors.length === 0;
    }

    // Show field error
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            
            // Find or create error message element
            let errorElement = document.getElementById(fieldId + 'Error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = fieldId + 'Error';
                errorElement.className = 'field-error';
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Reset form
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.clearAllFieldErrors();
        }
    }

    // Render products
    renderProducts() {
        const startTime = performance.now();
        
        try {
            const container = document.getElementById('productsList');
            const emptyState = document.getElementById('emptyState');
            
            if (!container) return;
            
            // Get products to show
            const productsToShow = this.filteredProducts || this.products;
            
            if (productsToShow.length === 0) {
                container.innerHTML = '';
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
                return;
            }
            
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Use virtual scroll or directly render
            if (this.virtualScrollEnabled && productsToShow.length > 50) {
                this.renderVirtualProducts(productsToShow);
            } else {
                this.renderAllProducts(productsToShow);
            }
            
            const endTime = performance.now();
            this.monitorPerformance('renderProducts', endTime - startTime);
            
        } catch (error) {
            console.error('Rendering products failed:', error);
        }
    }

    // Render all products
    renderAllProducts(products) {
        const container = document.getElementById('productsList');
        const fragment = document.createDocumentFragment();
        
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            fragment.appendChild(productCard);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    // Create product card
    createProductCard(product) {
        // Check cache
        const cacheKey = `${product.id}_${product.updatedAt || product.createdAt}`;
        if (this.renderCache.has(cacheKey)) {
            return this.renderCache.get(cacheKey).cloneNode(true);
        }
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        
        const warrantyInfo = this.calculateWarrantyStatus(product);
        const warrantyClass = this.getWarrantyStatusClass(warrantyInfo.status);
        
        card.innerHTML = `
            <div class="product-header">
                <div class="product-title-section">
                    <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                    <div class="product-meta">
                        ${product.brand ? `<span class="brand">${this.escapeHtml(product.brand)}</span>` : ''}
                        ${product.model ? `<span class="model">${this.escapeHtml(product.model)}</span>` : ''}
                    </div>
                </div>
                <div class="warranty-badge ${warrantyClass}">
                    <i class="fas ${this.getWarrantyIcon(warrantyInfo.status)}"></i>
                    <span>${warrantyInfo.statusText}</span>
                </div>
            </div>
            
            <div class="product-body">
                <div class="product-details">
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-tag"></i> Category:</span>
                        <span class="value">${product.category || 'Uncategorized'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-calendar-alt"></i> Purchase Date:</span>
                        <span class="value">${this.formatDate(product.purchaseDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-shield-alt"></i> Warranty Period:</span>
                        <span class="value">${product.warrantyPeriod || 0} months</span>
                    </div>
                    ${warrantyInfo.expiryDate ? `
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-clock"></i> Warranty Expires:</span>
                        <span class="value warranty-expiry ${warrantyClass}">${this.formatDate(warrantyInfo.expiryDate)}</span>
                    </div>
                    ` : ''}
                    ${product.price > 0 ? `
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-dollar-sign"></i> Price:</span>
                        <span class="value">RM ${product.price.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${product.store ? `
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-store"></i> Store:</span>
                        <span class="value">${this.escapeHtml(product.store)}</span>
                    </div>
                    ` : ''}
                    ${product.serialNumber ? `
                    <div class="detail-row">
                        <span class="label"><i class="fas fa-barcode"></i> Serial Number:</span>
                        <span class="value">${this.escapeHtml(product.serialNumber)}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${product.notes ? `
                <div class="product-notes">
                    <div class="notes-header">
                        <i class="fas fa-sticky-note"></i>
                        <span>Notes</span>
                    </div>
                    <div class="notes-content">${this.escapeHtml(product.notes)}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="product-actions">
                <button class="btn btn-outline btn-edit" onclick="productManager.editProduct('${product.id}')" title="Edit product">
                    <i class="fas fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button class="btn btn-danger btn-delete" onclick="productManager.deleteProduct('${product.id}')" title="Delete product">
                    <i class="fas fa-trash-alt"></i>
                    <span>Delete</span>
                </button>
            </div>
        `;
        
        // Cache rendering result
        this.renderCache.set(cacheKey, card.cloneNode(true));
        
        return card;
    }

    // Calculate warranty status
    calculateWarrantyStatus(product) {
        if (!product.purchaseDate || !product.warrantyPeriod) {
            return {
                status: 'unknown',
            statusText: 'Unknown',
                expiryDate: null,
                daysRemaining: null
            };
        }
        
        // Check cache
        const cacheKey = `${product.purchaseDate}_${product.warrantyPeriod}`;
        if (product._warrantyCache && product._warrantyCache.key === cacheKey) {
            return product._warrantyCache.data;
        }
        
        const purchaseDate = new Date(product.purchaseDate);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + product.warrantyPeriod);
        
        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let status, statusText;
        
        if (daysRemaining < 0) {
            status = 'expired';
            statusText = 'Expired';
        } else if (daysRemaining <= 30) {
            status = 'expiring';
            statusText = 'Expiring Soon';
        } else {
            status = 'valid';
            statusText = 'Valid';
        }
        
        const result = {
            status,
            statusText,
            expiryDate: expiryDate.toISOString().split('T')[0],
            daysRemaining
        };
        
        // Cache result
        product._warrantyCache = {
            key: cacheKey,
            data: result
        };
        
        return result;
    }

    // Get warranty status class
    getWarrantyStatusClass(status) {
        const classes = {
            'valid': 'warranty-valid',
            'expiring': 'warranty-expiring',
            'expired': 'warranty-expired',
            'unknown': 'warranty-unknown'
        };
        return classes[status] || 'warranty-unknown';
    }

    // Get warranty status icon
    getWarrantyIcon(status) {
        const icons = {
            'valid': 'fa-shield-alt',
            'expiring': 'fa-exclamation-triangle',
            'expired': 'fa-times-circle',
            'unknown': 'fa-question-circle'
        };
        return icons[status] || 'fa-question-circle';
    }

    // HTML escape
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return 'Not set';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    }

    // Filter products
    filterProducts() {
        const startTime = performance.now();
        
        try {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const warrantyFilter = document.getElementById('warrantyFilter').value;
            
            // Generate filter key for caching
            const filterKey = `${searchTerm}_${categoryFilter}_${warrantyFilter}`;
            
            // If filter conditions have not changed, directly return
            if (this.lastFilterKey === filterKey && this.filteredProducts) {
                return;
            }
            
            this.lastFilterKey = filterKey;
            
            let filtered = this.products;
            
            // Search filter
            if (searchTerm) {
                filtered = filtered.filter(product => {
                    return product.name.toLowerCase().includes(searchTerm) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                           (product.model && product.model.toLowerCase().includes(searchTerm)) ||
                           (product.category && product.category.toLowerCase().includes(searchTerm));
                });
            }
            
            // Category filter
            if (categoryFilter) {
                filtered = filtered.filter(product => product.category === categoryFilter);
            }
            
            // Warranty status filter
            if (warrantyFilter) {
                filtered = filtered.filter(product => {
                    const warrantyInfo = this.calculateWarrantyStatus(product);
                    return warrantyInfo.status === warrantyFilter;
                });
            }
            
            this.filteredProducts = filtered;
            this.renderProducts();
            this.updateStats();
            
            const endTime = performance.now();
            this.monitorPerformance('filterProducts', endTime - startTime);
            
        } catch (error) {
            console.error('Failed to filter products:', error);
        }
    }

    // Update statistics
    updateStats() {
        try {
            const totalElement = document.getElementById('totalProducts');
            if (totalElement) {
                const displayedCount = this.filteredProducts ? this.filteredProducts.length : this.products.length;
                const totalCount = this.products.length;
                
                if (this.filteredProducts && this.filteredProducts.length !== totalCount) {
                    totalElement.textContent = `Displayed: ${displayedCount} / Total: ${totalCount} products`;
                } else {
                    totalElement.textContent = `Total: ${totalCount} products`;
                }
            }
        } catch (error) {
            console.error('Failed to update statistics:', error);
        }
    }

    // Edit product
    editProduct(productId) {
        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showNotification('Product not found', 'error');
                return;
            }
            
            this.currentEditId = productId;
            
            // Fill edit form
            document.getElementById('editProductName').value = product.name || '';
            document.getElementById('editBrand').value = product.brand || '';
            document.getElementById('editModel').value = product.model || '';
            document.getElementById('editCategory').value = product.category || '';
            document.getElementById('editSerialNumber').value = product.serialNumber || '';
            document.getElementById('editPurchaseDate').value = product.purchaseDate || '';
            document.getElementById('editWarrantyPeriod').value = product.warrantyPeriod || '';
            document.getElementById('editPrice').value = product.price || '';
            document.getElementById('editStore').value = product.store || '';
            document.getElementById('editNotes').value = product.notes || '';
            
            // Show edit modal
            this.showModal('editModal');
            
        } catch (error) {
            console.error('Failed to edit product:', error);
            this.showNotification('Failed to edit product', 'error');
        }
    }

    // Update product
    updateProduct() {
        try {
            if (!this.currentEditId) {
                this.showNotification('No product selected for editing', 'error');
                return;
            }
            
            // Clear previous errors
            this.clearAllFieldErrors();
            
            const formData = this.getFormData('editProductForm');
            
            if (!this.validateProduct(formData, true)) {
                this.showNotification('Product information validation failed, please check the form.', 'error');
                return;
            }
            
            const updatedProduct = {
                ...this.products.find(p => p.id === this.currentEditId),
                ...formData,
                updatedAt: new Date().toISOString()
            };
            
            // Save product
            this.saveProduct(updatedProduct);
            
            // Clear cache
            this.renderCache.clear();
            this.filteredProducts = null;
            this.lastFilterKey = null;
            
            // Re-render and update statistics
            this.renderProducts();
            this.updateStats();
            
            this.closeModal('editModal');
            this.currentEditId = null;
            this.showNotification('Product updated successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to update product:', error);
            this.showNotification(`Failed to update product: ${error.message || 'Please try again'}`, 'error');
        }
    }

    // Delete product (show confirmation dialog)
    deleteProduct(productId) {
        this.currentDeleteId = productId;
        this.showModal('deleteModal');
    }

    // Confirm delete
    confirmDelete() {
        try {
            if (!this.currentDeleteId) {
                this.showNotification('No product selected for deletion', 'error');
                return;
            }
            
            // Delete product
            this.deleteProduct(this.currentDeleteId);
            
            // Clear cache
            this.renderCache.clear();
            this.filteredProducts = null;
            this.lastFilterKey = null;
            
            // Re-render and update statistics
            this.renderProducts();
            this.updateStats();
            
            this.closeModal('deleteModal');
            this.currentDeleteId = null;
            this.showNotification('Product deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to delete product:', error);
            this.showNotification(`Failed to delete product: ${error.message || 'Please try again'}`, 'error');
        }
    }

    // Export data
    exportData() {
        try {
            const dataToExport = {
                products: this.products,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `product_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }

    // Import data
    importData(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.products || !Array.isArray(data.products)) {
                        this.showNotification('Invalid data format', 'error');
                        return;
                    }
                    
                    // Clear existing data
                    this.clearAllData();
                    
                    // Import new data
                    this.products = data.products.map(product => ({
                        ...product,
                        id: product.id || this.generateId(),
                        importedAt: new Date().toISOString()
                    }));
                    
                    // Save to local storage
                    this.saveProducts();
                    
                    // Clear cache
                    this.renderCache.clear();
                    this.filteredProducts = null;
                    this.lastFilterKey = null;
                    
                    // Re-render and update statistics
                    this.renderProducts();
                    this.updateStats();
                    
                    this.showNotification(`Successfully imported ${this.products.length} products!`, 'success');
                    
                } catch (error) {
                    console.error('Failed to parse import file:', error);
                    this.showNotification('File format error, please check file content', 'error');
                }
            };
            
            reader.readAsText(file);
            
            // Clear file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Failed to import data:', error);
            this.showNotification('Failed to import data', 'error');
        }
    }

    // Confirm clear data
    confirmClearData() {
        if (confirm('Are you sure you want to clear all product data? This operation cannot be undone!')) {
            this.clearAllData();
        }
    }

    // Clear all data
    clearAllData() {
        try {
            this.products = [];
            this.saveProducts();
            
            // Clear cache
            this.renderCache.clear();
            this.filteredProducts = null;
            this.lastFilterKey = null;
            
            // Re-render and update statistics
            this.renderProducts();
            this.updateStats();
            
            this.showNotification('All data has been cleared', 'success');
            
        } catch (error) {
            console.error('Failed to clear data:', error);
            this.showNotification('Failed to clear data', 'error');
        }
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Automatically remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Get notification icon
    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
}

// Global function (for HTML calling)
function closeEditModal() {
    productManager.closeModal('editModal');
}

function closeDeleteModal() {
    productManager.closeModal('deleteModal');
}

function confirmDelete() {
    productManager.confirmDelete();
}

function setWarrantyPeriod(months) {
    const warrantyField = document.getElementById('editWarrantyPeriod');
    if (warrantyField) {
        warrantyField.value = months;
    }
}

// Initialize application
let productManager;
document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});
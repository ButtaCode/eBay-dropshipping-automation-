class DropshipApp {
    constructor() {
        this.isAutomationRunning = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupNavigation();
    }

    setupEventListeners() {
        document.getElementById('connectEbay').addEventListener('click', () => this.connectEbay());
        document.getElementById('startAutomation').addEventListener('click', () => this.toggleAutomation());
        document.getElementById('researchProducts').addEventListener('click', () => this.researchProducts());
        document.getElementById('syncOrders').addEventListener('click', () => this.syncOrders());
        
        document.getElementById('minProfit').addEventListener('change', (e) => this.validateProfitMargins(e));
        document.getElementById('maxProfit').addEventListener('change', (e) => this.validateProfitMargins(e));
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    showSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
    }

    async connectEbay() {
        try {
            const response = await fetch('/.netlify/functions/auth-ebay');
            const data = await response.json();
            
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                this.showNotification('Failed to initiate eBay connection', 'error');
            }
        } catch (error) {
            this.showNotification('Error connecting to eBay', 'error');
        }
    }

    async toggleAutomation() {
        const button = document.getElementById('startAutomation');
        const status = document.getElementById('automationStatus');
        
        if (!this.isAutomationRunning) {
            const minProfit = document.getElementById('minProfit').value;
            const maxProfit = document.getElementById('maxProfit').value;
            
            try {
                const response = await fetch('/.netlify/functions/start-automation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        minProfit: parseInt(minProfit),
                        maxProfit: parseInt(maxProfit)
                    })
                });
                
                if (response.ok) {
                    this.isAutomationRunning = true;
                    button.innerHTML = '<i class="fas fa-pause"></i> Stop Automation';
                    button.classList.remove('pulse');
                    status.className = 'status online';
                    status.innerHTML = '<i class="fas fa-circle"></i><span>Automation Running - $100-150 Profit Mode</span>';
                    
                    this.showNotification('Automation started successfully!', 'success');
                    this.startProgressAnimation();
                }
            } catch (error) {
                this.showNotification('Failed to start automation', 'error');
            }
        } else {
            this.isAutomationRunning = false;
            button.innerHTML = '<i class="fas fa-play"></i> Start Automation';
            button.classList.add('pulse');
            status.className = 'status offline';
            status.innerHTML = '<i class="fas fa-circle"></i><span>Automation Offline</span>';
            
            this.showNotification('Automation stopped', 'warning');
        }
    }

    startProgressAnimation() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        let progress = 0;
        
        const interval = setInterval(() => {
            if (!this.isAutomationRunning) {
                clearInterval(interval);
                progressFill.style.width = '0%';
                progressText.textContent = 'Ready to start automation';
                return;
            }
            
            progress += Math.random() * 5;
            if (progress > 100) progress = 0;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Processing... ${Math.round(progress)}%`;
            
        }, 1000);
    }

    async researchProducts() {
        try {
            const response = await fetch('/.netlify/functions/product-research');
            const data = await response.json();
            
            if (data.products) {
                this.displayProducts(data.products);
                this.showNotification(`Found ${data.products.length} high-profit products`, 'success');
            }
        } catch (error) {
            this.showNotification('Failed to research products', 'error');
        }
    }

    displayProducts(products) {
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No High-Profit Products Found</h3>
                    <p>Try adjusting your profit margins</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = `
                <div class="product-card">
                    <div class="product-image">
                        <i class="fas ${product.icon || 'fa-cube'}"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-title">${product.title}</div>
                        <div class="product-details">
                            <span class="product-price">$${product.price}</span>
                            <span class="product-cost">Cost: $${product.cost}</span>
                        </div>
                        <div class="product-profit">Profit: $${product.profit}</div>
                    </div>
                </div>
            `;
            grid.innerHTML += productCard;
        });
    }

    async syncOrders() {
        try {
            const response = await fetch('/.netlify/functions/sync-orders');
            const data = await response.json();
            
            if (data.orders) {
                this.displayOrders(data.orders);
                this.showNotification(`Synced ${data.orders.length} orders`, 'success');
            }
        } catch (error) {
            this.showNotification('Failed to sync orders', 'error');
        }
    }

    displayOrders(orders) {
        const ordersList = document.getElementById('ordersList');
        
        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>No Orders Yet</h3>
                    <p>Orders will appear here once you start making sales</p>
                </div>
            `;
            return;
        }
        
        ordersList.innerHTML = '';
        
        orders.forEach(order => {
            const orderItem = `
                <div class="order-item">
                    <div class="order-header">
                        <span class="order-id">${order.id}</span>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <span class="order-product">${order.product}</span>
                        <span class="order-profit">+$${order.profit}</span>
                    </div>
                </div>
            `;
            ordersList.innerHTML += orderItem;
        });
    }

    async loadDashboardData() {
        setTimeout(() => {
            document.getElementById('activeListings').textContent = '1,247';
            document.getElementById('todayOrders').textContent = '12';
            document.getElementById('todayProfit').textContent = '$1,450';
            document.getElementById('totalProfit').textContent = '$12,847';
        }, 1500);
    }

    validateProfitMargins(e) {
        const minProfit = parseInt(document.getElementById('minProfit').value);
        const maxProfit = parseInt(document.getElementById('maxProfit').value);
        
        if (minProfit >= maxProfit) {
            this.showNotification('Minimum profit must be less than maximum profit', 'warning');
            e.target.value = minProfit >= maxProfit ? maxProfit - 1 : minProfit;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .order-item {
        background: var(--card-bg);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        border: 1px solid var(--border);
    }
    
    .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    
    .order-status {
        padding: 5px 15px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .order-status.completed {
        background: rgba(0, 210, 106, 0.1);
        color: var(--success);
    }
    
    .order-status.processing {
        background: rgba(255, 179, 0, 0.1);
        color: var(--warning);
    }
    
    .order-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .analytics-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 30px;
    }
    
    .analytics-card {
        background: var(--card-bg);
        border-radius: 15px;
        padding: 25px;
        border: 1px solid var(--border);
    }
    
    .chart-placeholder {
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.5);
    }
`;
document.head.appendChild(notificationStyles);

document.addEventListener('DOMContentLoaded', () => {
    new DropshipApp();
});

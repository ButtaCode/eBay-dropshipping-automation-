class DropshipApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 AutoDropship Pro Loaded');
        this.loadStats();
    }

    loadStats() {
        // Simulate loading data
        setTimeout(() => {
            document.getElementById('activeListings').textContent = '1,247';
            document.getElementById('todayProfit').textContent = '$1,450';
        }, 1000);
    }
}

new DropshipApp();

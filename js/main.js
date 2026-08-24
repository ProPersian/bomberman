// Import all required modules
import { Game } from './Game.js';

// Initialize the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game(); // ذخیره در متغیر گلوبال برای بررسی
  console.log('✅ Game initialized:', window.game);
});
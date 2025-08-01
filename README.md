# Product Information Recording Tool

A modern web-based product information management tool that helps you easily record and track purchased product information and warranty status.

## 🌟 Main Features

### 📝 Product Information Management
- **Complete product information recording**: Product name, brand, model, category, purchase date, etc.
- **Warranty period tracking**: Automatically calculate warranty expiration time, intelligent warranty status reminders
- **Purchase information recording**: Price, store, notes and other detailed information
- **Category management**: Support for electronics, appliances, digital devices, furniture and other categories

### 🔍 Smart Search & Filtering
- **Real-time search**: Support quick search by product name, brand, model
- **Category filtering**: Quick filtering by product category
- **Warranty status filtering**: View products with valid warranty, expiring soon, or expired
- **Combined filtering**: Multi-condition combined filtering for precise target product location

### 📊 Warranty Status Management
- **Smart status recognition**:
  - 🟢 Valid warranty (green)
  - 🟡 Expiring soon (within 30 days, yellow)
  - 🔴 Expired (red)
- **Expiration reminders**: Clear display of remaining warranty days
- **Warranty date calculation**: Automatic calculation based on purchase date and warranty period

### 💾 Local Data Storage
- **Browser local storage**: Data saved locally, no internet required
- **Data persistence**: Data is not lost after closing the browser
- **Import/export functionality**: Support JSON format data backup and recovery
- **Drag-and-drop import**: Directly drag JSON files to import data

### 🎨 Modern Interface Design
- **Responsive design**: Perfect adaptation for desktop, tablet, mobile
- **Dark mode support**: Automatically adapts to system theme preferences
- **Accessibility design**: Support for keyboard navigation and screen readers
- **Smooth animations**: Carefully designed transition animations and interactive effects

## 🚀 Technical Features

### Frontend Technology Stack
- **HTML5**: Semantic tags, improved accessibility
- **CSS3**:
  - CSS Grid and Flexbox layout
  - CSS Variables (Custom Properties)
  - Responsive design (Mobile First)
  - Dark mode support
  - Animations and transition effects
- **JavaScript ES6+**:
  - Modular class design
  - Asynchronous processing
  - Local Storage API
  - Event delegation
  - Error handling

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Usage Instructions

### Adding Products
1. Fill in basic product information (product name is required)
2. Select purchase date (required)
3. Enter warranty period (in months)
4. Fill in other optional information
5. Click "Save Product" button

### Searching Products
- Enter keywords in the search box
- Use category dropdown menu for filtering
- Use warranty status filter
- Support multi-condition combined filtering

### Editing Products
1. Click the "Edit" button on the product card
2. Modify information in the popup modal
3. Click "Save Changes" to confirm modifications

### Deleting Products
1. Click the "Delete" button on the product card
2. Click "Delete" in the confirmation dialog to confirm

### Data Backup
- **Export**: Use Ctrl+E shortcut or custom export function
- **Import**: Drag JSON files to the page or use file selector

## ⌨️ Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl + N` | Add new product |
| `Ctrl + E` | Export data |
| `Ctrl + F` | Focus search box |
| `Ctrl + T` | Switch theme |
| `Escape` | Close modal/Clear search |
| `Enter` | Confirm operation |
| `Tab` | Navigate between form fields |

## 🔍 Warranty Status Description

| Status | Description | Color |
|--------|-------------|-------|
| **Active** | Within warranty period | Green |
| **Expiring** | Expires within 30 days | Orange |
| **Expired** | Warranty has expired | Red |
| **Unknown** | No warranty information | Gray |

## 📂 Project Structure

```
system-info-checker/
├── index.html          # Main page
├── styles.css          # Style file
├── script.js           # Main logic
└── README.md          # Project documentation
```

## 🔧 Local Development

1. Download project files to local directory
2. Open `index.html` with a modern browser
3. Start using!

> Note: Since local storage is used, it's recommended to run with an HTTP server for the best experience.

## 💡 Usage Tips

### Data Management
- Regularly export data as backup
- Add detailed notes for important products
- Update product information changes promptly

### Warranty Management
- Set accurate warranty period information
- Regularly check products about to expire
- Keep purchase receipts and warranty cards

### Category Suggestions
- Customize categories according to personal needs
- Maintain category consistency
- Avoid creating too many subcategories

## 🔒 Privacy & Security

- **Local Storage**: All data is saved only in your browser locally
- **No Network Transmission**: No data is sent to any servers
- **Open Source Transparency**: Code is completely open, free to view and modify

## 🚧 Future Plans

- [ ] PWA support (offline usage)
- [ ] Cloud data synchronization
- [ ] Product image upload
- [ ] Warranty reminder notifications
- [ ] Statistical reporting features
- [ ] Batch operation functions
- [ ] QR code generation
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License. You are free to use, modify, and distribute it.

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this project!

---

**Enjoy your product management experience!** 🎉
# GAIming Frontend

A modern, responsive React frontend for the GAIming AI-powered gaming recommendation system.

## 🚀 Features

- **Modern React Stack**: Built with React 18, TypeScript, and Vite
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **State Management**: Zustand for efficient state management
- **API Integration**: React Query for server state management
- **Authentication**: JWT-based authentication with auto-refresh
- **Dark Mode**: System-aware dark/light theme support
- **Real-time Updates**: Live data updates for analytics
- **Performance**: Code splitting and lazy loading
- **Accessibility**: WCAG compliant components

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Charts**: Chart.js with React Chart.js 2
- **Icons**: Lucide React
- **Notifications**: React Toastify

## 📦 Installation

1. **Install dependencies**:
   ```bash
   cd gaiming-frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── ui/             # Basic UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── charts/         # Chart components
│   └── export/         # Export-related components
├── pages/              # Page components
├── services/           # API service layer
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── config/             # Configuration files
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── assets/             # Static assets
```

## 🎨 Key Components

### Layout System
- **Sidebar**: Collapsible navigation with tooltips
- **Header**: Search, theme toggle, notifications, user menu
- **Layout**: Responsive layout wrapper

### State Management
- **Auth Store**: User authentication and session management
- **Theme Store**: Theme preferences and UI settings

### API Services
- **Recommendation Service**: ML recommendation endpoints
- **Game Service**: Game catalog management
- **Player Service**: Player data and analytics

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## 🎯 Key Features

### Dashboard
- Real-time metrics and KPIs
- Algorithm performance overview
- System status monitoring
- Quick action buttons

### Games Management
- Game catalog browsing and filtering
- Performance analytics per game
- Recommendation effectiveness tracking

### Player Analytics
- Player behavior analysis
- Segmentation and profiling
- Recommendation history

### Recommendation Engine
- Algorithm comparison and A/B testing
- Performance metrics and analytics
- Real-time recommendation monitoring

### ML Model Management
- Model deployment and versioning
- Performance monitoring
- Feature importance analysis

## 🔐 Authentication

The app uses JWT-based authentication with:
- Automatic token refresh
- Secure token storage
- Route protection
- Session management

### Demo Credentials
- **Email**: admin@gaiming.com
- **Password**: password123

## 🎨 Theming

The app supports:
- Light/Dark mode toggle
- System preference detection
- Customizable color schemes
- Responsive design patterns

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Accessible navigation

## 🚀 Performance

- Code splitting with React.lazy()
- Image optimization
- Bundle size optimization
- Efficient re-rendering with React Query

## 🧪 Testing

- Unit tests with Vitest
- Component testing
- API mocking
- E2E testing setup

## 📈 Analytics Integration

- Real-time data updates
- Interactive charts and graphs
- Export functionality
- Custom date ranges

## 🔧 Development

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Layout/Sidebar.tsx`

### Adding New API Services
1. Create service in `src/services/`
2. Define types in `src/types/`
3. Add React Query hooks

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow component-based styling
- Maintain consistent spacing and colors
- Use semantic HTML elements

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `dist/` folder can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps

### Environment Variables
Set the following in your hosting platform:
- `VITE_API_BASE_URL`: Your API endpoint
- `VITE_NODE_ENV`: production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ for the GAIming recommendation system.

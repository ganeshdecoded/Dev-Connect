# DevConnect

**DevConnect** is a decentralized platform that connects developers with clients for instant video consultations using cryptocurrency payments. The platform enables real-time booking, secure crypto transactions, and high-quality video calls.

## Features

### For Clients
- Browse developer profiles with detailed expertise and ratings.
- View real-time availability status.
- Book instant or scheduled sessions.
- Pay securely with cryptocurrency (ETH).
- Join high-quality video consultations.
- Rate and review developers.

### For Developers
- Create professional profiles.
- Set custom hourly rates.
- Manage availability schedule.
- Receive crypto payments directly.
- Host video consultations.
- Build reputation through ratings.

## Technology Stack
- **Frontend**: React.js with Material-UI.
- **Blockchain**: Web3.js, MetaMask integration.
- **Video**: Agora RTC SDK.
- **State Management**: React Context API.
- **Routing**: React Router v7.
- **Storage**: LocalStorage with encryption.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MetaMask wallet extension
- Modern web browser

### Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/devconnect.git
    cd devconnect
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

## Project Structure

### Key Components

#### Video Integration
The platform uses **Agora RTC** for high-quality video calls with features like:
- Multi-participant support.
- Audio/video controls.
- Connection status monitoring.
- Automatic reconnection.

#### Crypto Payments
Integrated **Web3** payment system supporting:
- ETH transactions.
- Real-time balance checks.
- Transaction status monitoring.
- Mock payment option for testing.

#### Booking System
Sophisticated booking management with:
- Real-time availability updates.
- Session scheduling.
- Status tracking.
- Automatic cleanup.

## Environment Setup

Create a `.env` file in the root directory:
```env
VITE_AGORA_APP_ID=your_agora_app_id
VITE_CONTRACT_ADDRESS=your_contract_address
```

## Development

### Running Tests
Run the test suite with:
```bash
npm run test
```

## Contributing

1. Fork the repository.
2. Create your feature branch:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3. Commit your changes:
    ```bash
    git commit -m 'Add some AmazingFeature'
    ```
4. Push to the branch:
    ```bash
    git push origin feature/AmazingFeature
    ```
5. Open a Pull Request.

## Security

- All crypto transactions are handled through **MetaMask**.
- Video calls are encrypted end-to-end.
- User data is stored locally with encryption.
- Session tokens are temporary and secured.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Agora.io** for video SDK.
- **MetaMask** for wallet integration.
- **Material-UI** for components.
- **React community** for tools and libraries.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers at [support@devconnect.com](mailto:support@devconnect.com).


import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard shell title', () => {
  render(<App />);
  const heading = screen.getByText(/Tableau de bord optimisé/i);
  expect(heading).toBeInTheDocument();
});

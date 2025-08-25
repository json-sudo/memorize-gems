import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders app shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /flashcards/i })).toBeInTheDocument();
});

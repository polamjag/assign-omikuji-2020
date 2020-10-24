import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders heading', () => {
  const { getByText } = render(<App />);
  const headingElement = getByText(/Assign Omikuji 2020/i);
  expect(headingElement).toBeInTheDocument();
});

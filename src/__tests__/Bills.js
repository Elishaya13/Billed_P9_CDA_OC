/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
// Importing extend-expect to enhance Jest assertions with additional matchers
import '@testing-library/jest-dom/extend-expect';

// Tests for BillsUi.js
describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    // Test to ensure the window icon in vertical layout is highlighted
    test('Then bill icon in vertical layout should be highlighted', async () => {
      // Set up local storage for employee authentication
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      // Create a root element for rendering and append it to the document
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);

      // Set up the router and navigate to the Bills page
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Wait for the window icon to be rendered
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //Add assertion
      expect(windowIcon).toBeTruthy();
      expect(windowIcon).toHaveClass('active-icon');
    });

    // Test to ensure bills are ordered from earliest to latest
    test('Then bills should be ordered from earliest to latest', () => {
      // Set up the Bills UI with sample data
      document.body.innerHTML = BillsUI({ data: bills });

      // Extract and sort dates from the bills
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // Add assertion for sorted dates
      expect(dates).toEqual(datesSorted);
    });

    // Test to ensure there is a button for a new bill
    test('Then, Bills have a button for a new bill', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const buttonText = screen.getByText('Nouvelle note de frais');
      expect(buttonText).toBeTruthy();
    });

    // Test to ensure eyes icons are present
    test('Then, I see eyes icons', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const eyesIcons = screen.getAllByTestId('icon-eye');
      expect(eyesIcons).toBeTruthy();
    });
  });
});

// Tests for Bills.js
describe('Given I am connected as an employee', () => {
  describe('When I click on eye icon', () => {
    test('Should open a modal, and the displayed file should be present in the document', async () => {
      // Mock local storage for employee authentication
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );

      // Set up the Bills UI with sample data
      document.body.innerHTML = BillsUI({ data: bills });

      // Define a navigation function for route changes
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Create a Bills container instance
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      /*  Mock jQuery modal function - Bills.js - line 27 */
      $.fn.modal = jest.fn();

      // Get the first eye icon and simulate a click
      const eyeIcon = screen.getAllByTestId('icon-eye')[0];
      const handleClickIconEye = jest.spyOn(
        billsContainer,
        'handleClickIconEye'
      );
      fireEvent.click(eyeIcon);

      // Check if the modal function and show method are called
      expect(handleClickIconEye).toHaveBeenCalledWith(eyeIcon);
      expect($.fn.modal).toHaveBeenCalledWith('show');

      // Check if an image is present in the modal
      const modalImage = screen.getByAltText('Bill');
      expect(modalImage).toBeInTheDocument();

      // Check if the displayed image URL matches the expected URL from the sample data
      const expectedImageUrl = bills[0].fileUrl;
      expect(modalImage).toHaveAttribute('src', expectedImageUrl);
    });
  });
});

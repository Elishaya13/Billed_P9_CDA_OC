/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
import '@testing-library/jest-dom/extend-expect';

import { log } from 'console';
import Bills from '../containers/Bills.js';

// BillsUi
describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //Add assertion
      expect(windowIcon).toBeTruthy();
      expect(windowIcon).toHaveClass('active-icon');
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test('Then, Bills have a button for a new bill', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const buttonText = screen.getByText('Nouvelle note de frais');
      expect(buttonText).toBeTruthy();
    });

    test('Then, I see eyes icons', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const eyesIcons = screen.getAllByTestId('icon-eye');
      expect(eyesIcons).toBeTruthy();
    });
  });
});
//Bills.js
describe('Given I am connected as an employee', () => {
  describe('When I click on eye icon', () => {
    test('Should open a modal', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );

      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      /* JQuery Mock function - Bills.js - line 27 */
      $.fn.modal = jest.fn();

      const eyeIcon = screen.getAllByTestId('icon-eye')[0];
      const handleClickIconEye = jest.spyOn(
        billsContainer,
        'handleClickIconEye'
      );

      fireEvent.click(eyeIcon);

      expect(handleClickIconEye).toHaveBeenCalledWith(eyeIcon);
      expect($.fn.modal).toHaveBeenCalledWith('show');
    });
  });
});

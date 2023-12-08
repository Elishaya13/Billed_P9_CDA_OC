/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import mockStore from '../__mocks__/store.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import userEvent from '@testing-library/user-event';

import router from '../app/Router.js';

jest.mock('../app/store', () => mockStore);

// * TESTS UI * //
describe('Given I am connected as an employee', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    );
  });

  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    // Test to verify if the mail icon is highlighted
    test('Then the mail icon in vertical layout should be highlighted', () => {
      expect(screen.getByTestId('icon-mail')).toHaveClass('active-icon');
      expect(screen.getByTestId('icon-window')).not.toHaveClass('active-icon');
    });

    // Test to verify if the form is displayed
    test('Then the new bill page should display a form and a title', () => {
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });

    //-- Form field testS --//
    test('Then the form should have a field for expense type, datepicker, amount, pct and file, which would be required', () => {
      const expenseType = screen.getByTestId('expense-type');
      expect(expenseType).toBeTruthy();
      expect(expenseType.hasAttribute('required')).toBe(true);

      const datePicker = screen.getByTestId('datepicker');
      expect(datePicker).toBeTruthy();
      expect(datePicker.hasAttribute('required')).toBe(true);

      const amount = screen.getByTestId('amount');
      expect(amount).toBeTruthy();
      expect(amount.hasAttribute('required')).toBe(true);

      const pct = screen.getByTestId('pct');
      expect(pct).toBeTruthy();
      expect(pct.hasAttribute('required')).toBe(true);

      const file = screen.getByTestId('file');
      expect(file).toBeTruthy();
      expect(file.hasAttribute('required')).toBe(true);
    });
    test('Then the form should have a field for expense name, TVA(vat) and comments,  wich would be not required', () => {
      const expenseName = screen.getByTestId('expense-name');
      expect(expenseName).toBeTruthy();
      expect(expenseName.hasAttribute('required')).toBe(false);

      const vatAmountField = screen.getByTestId('vat');
      expect(vatAmountField).toBeTruthy();
      expect(vatAmountField.hasAttribute('required')).toBe(false);

      const commentary = screen.getByTestId('commentary');
      expect(commentary).toBeTruthy();
      expect(commentary.hasAttribute('required')).toBe(false);
    });
    test('Then the form should have a submit button', () => {
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeTruthy();
      expect(submitButton.getAttribute('type')).toEqual('submit');
    });
  });
});

// *-- INTEGRATIONS TESTS --* //
describe('Given I am connected as an employee', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'a@a',
      })
    );
  });
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('Then I upload a valid file, the file name should be displayed into the input and submit button is not disabled and no error message is displayed', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      const handleChangeFile = spyOn(newBill, 'handleChangeFile');
      const fileInput = screen.getByTestId('file');

      const file = new File(['valideFile.png'], 'valideFile.png', {
        type: 'image/png',
      });

      await userEvent.upload(fileInput, file);

      const submitBtn = screen.getByTestId('submit-button');
      const fileErrorMessage = screen.getByTestId('fileErrorMessage');

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0]).toEqual(file);

      // Check if the button is clickable
      expect(submitBtn).not.toBeDisabled();

      // Check if error message is empty
      expect(fileErrorMessage.textContent).toBe('');
    });

    test('Then and I upload an invalid format file, the file name should be displayed into the input and submit button is disabled and error message is displayed', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      const handleChangeFile = spyOn(newBill, 'handleChangeFile');
      const fileInput = screen.getByTestId('file');
      const file = new File(['invalideFile.pdf'], 'invalideFile.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(fileInput, file);

      const submitBtn = screen.getByTestId('submit-button');
      const fileErrorMessage = screen.getByTestId('fileErrorMessage');

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0]).toEqual(file);

      // Check if the button is not clickable and if an error message is displayed
      expect(submitBtn).toBeDisabled();
      expect(fileErrorMessage.textContent).toBe(
        'Type de fichier non pris en charge. Seuls les fichiers JPEG, JPG et PNG sont autorisés.'
      );
    });
  });
});
// to do - test POST test handlesubmit - 404 - 500

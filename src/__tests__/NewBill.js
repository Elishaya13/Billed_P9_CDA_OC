/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockStore from '../__mocks__/store.js';
import { ROUTES } from '../constants/routes.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page, and I select a valid file', () => {
    test('Then the file name should be displayed into the input and submit button is not disabled', () => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage,
      });

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const fileInput = screen.getByTestId('file');

      fileInput.addEventListener('change', handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['valideFile.png'], 'valideFile.png', {
              type: 'image/png',
            }),
          ],
        },
      });

      const submitBtn = screen.getByTestId('submit-button');

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe('valideFile.png');

      // Check if the button is clickable
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('When I am on NewBill page, and I upload an invalid format file', () => {
    test('Then the file name should be displayed into the input and submit button is disabled', () => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = mockStore;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const fileInput = screen.getByTestId('file');
      const submitBtn = screen.getByTestId('submit-button');
      const fileErrorMessage = screen.getByTestId('fileErrorMessage');

      fileInput.addEventListener('change', handleChangeFile);
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['invalideFile.pdf'], 'invalideFile.pdf', {
              type: 'application/pdf',
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe('invalideFile.pdf');

      // Check if the button is not clickable
      expect(submitBtn).toBeDisabled();
      expect(fileErrorMessage.textContent).toBe(
        'Type de fichier non pris en charge. Seuls les fichiers JPEG, JPG et PNG sont autorisés.'
      );
    });
  });
});

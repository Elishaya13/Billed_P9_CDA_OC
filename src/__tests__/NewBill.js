/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import mockStore from '../__mocks__/store.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import userEvent from '@testing-library/user-event';
import router from '../app/Router.js';
import NewBillUI from '../views/NewBillUI.js';
import { bills } from '../fixtures/bills.js';

jest.mock('../app/store', () => mockStore);

describe('NewBill', () => {
  beforeAll(() => {
    // Set up local storage for employee authentication
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
  //***********************//
  //****** UI tests *******/
  //*********************//
  describe('Given I am connected as an employee', () => {
    beforeEach(() => {
      // Create a root element for rendering and append it to the document
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);

      // Set up the router and navigate to the NewBills page
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    afterEach(() => {
      document.body.innerHTML = '';
    });

    describe('When I am on NewBill Page', () => {
      // Test to verify if the mail icon is highlighted
      test('Then the mail icon in vertical layout should be highlighted', () => {
        expect(screen.getByTestId('icon-mail')).toHaveClass('active-icon');
        expect(screen.getByTestId('icon-window')).not.toHaveClass(
          'active-icon'
        );
      });

      // Test to verify if the form is displayed
      test('Then the new bill page should display a form and a title', () => {
        expect(screen.getByTestId('form-new-bill')).toBeTruthy();
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
      });

      //-- Form field tests - required --//
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
      //-- Form field tests - not required --//
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
  //***********************//
  //** Integration tests *//
  //*********************//
  describe('When I am on NewBill page and uploading a file', () => {
    beforeEach(() => {
      // Create a root element for rendering and append it to the document
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);

      // Set up the router and navigate to the NewBills page
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    afterEach(() => {
      document.body.innerHTML = '';
    });

    // test to verify the upload with an invalid file
    test('Then I upload an invalid file, then an error message is displayed', async () => {
      let newBill;

      newBill = new NewBill({
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

    // test to verify the upload with a valid file
    test('Then I upload a valid file, the file name should be displayed into the input and submit button is not disabled and no error message is displayed', async () => {
      let newBill;

      newBill = new NewBill({
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
      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0]).toEqual(file);

      const submitBtn = screen.getByTestId('submit-button');
      const fileErrorMessage = screen.getByTestId('fileErrorMessage');

      // Check if the button is clickable
      expect(submitBtn).not.toBeDisabled();

      // Check if error message is empty
      expect(fileErrorMessage.textContent).toBe('');
    });
  });
});

//***********************//
//** Post tests *//
//*********************//
describe('I am on NewBill page', () => {
  beforeAll(() => {
    // Set up local storage for employee authentication
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

  beforeEach(() => {
    // Create a root element for rendering and append it to the document
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.append(root);
  });
  afterEach(() => {
    // Clear the document body after each test
    document.body.innerHTML = '';
    // Clear the mock data after each test
    jest.clearAllMocks();
  });

  describe('When I submit the form', () => {
    // test to verify that the handleSubmit method is called
    test('Then I click on submit button, the submit method is called ', async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = jest.fn();

      // Create a new instance of NewBill
      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Data from the fixture bills
      const dataInput = bills[0];

      // INPUTS FIELDS
      const expenseTypeInput = screen.getByTestId('expense-type');
      const expenseNameInput = screen.getByTestId('expense-name');
      const datePickerInput = screen.getByTestId('datepicker');
      const amountInput = screen.getByTestId('amount');
      const vatInput = screen.getByTestId('vat');
      const pctInput = screen.getByTestId('pct');
      const commentaryInput = screen.getByTestId('commentary');
      const submitBtn = screen.getByTestId('submit-button');
      const form = screen.getByTestId('form-new-bill');
      const fileInput = screen.getByTestId('file');

      // SPY
      const handleChangeFile = spyOn(newBillContainer, 'handleChangeFile');
      const handleSubmitSpy = jest.spyOn(newBillContainer, 'handleSubmit');
      const createSpy = jest.spyOn(mockStore.bills(), 'create');

      // Create a new file
      const file = new File(
        ['preview-facture-free-201801-pdf-1.jpg'],
        'preview-facture-free-201801-pdf-1.jpg',
        {
          type: 'image/jpg',
        }
      );

      // Change the file input
      await fireEvent.change(fileInput, { target: { files: [file] } });

      // Change the submit button property to enable it and set the isFormImgValid to true
      submitBtn.disabled = false;
      newBillContainer.isFormImgValid = true;

      // Change the input fields with the data from the fixture
      fireEvent.change(expenseTypeInput, { target: { value: dataInput.type } });
      fireEvent.change(expenseNameInput, {
        target: { value: dataInput.name },
      });
      fireEvent.change(datePickerInput, { target: { value: dataInput.date } });
      fireEvent.change(amountInput, {
        target: { value: String(dataInput.amount) },
      });
      fireEvent.change(vatInput, { target: { value: dataInput.vat } });
      fireEvent.change(pctInput, { target: { value: String(dataInput.pct) } });
      fireEvent.change(commentaryInput, {
        target: { value: dataInput.commentary },
      });

      // Verify that the file input has the file
      expect(fileInput.files[0]).toEqual(file);

      // Verify that the handleChangeFile method is called
      expect(handleChangeFile).toHaveBeenCalled();

      // Click on the submit button
      userEvent.click(submitBtn);

      // Verfiy that the handleSubmit method is called
      expect(handleSubmitSpy).toHaveBeenCalled();

      // Verify that the create method is called
      expect(createSpy).toHaveBeenCalled();
    });
  });

  describe('When I post a new bill', () => {
    // test to verify that the post method is called
    test('Then add new bill from the mock Api, the post method is called ', async () => {
      // SPY on the bills method
      const postSpy = jest.spyOn(mockStore, 'bills');

      // Data expected from the mock Api
      const bill = {
        id: '47qAXb6fIm2zOKkLzMro',
        vat: '80',
        fileUrl:
          'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
        status: 'pending',
        type: 'Hôtel et logement',
        commentary: 'séminaire billed',
        name: 'encore',
        fileName: 'preview-facture-free-201801-pdf-1.jpg',
        date: '2004-04-04',
        amount: 400,
        commentAdmin: 'ok',
        email: 'a@a',
        pct: 20,
      };

      // Call the update method from the bills method with the bill data
      const postBills = await mockStore.bills().update(bill);

      // Verify that the bills method is called
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postBills).toEqual(bill);
    });
  });
});


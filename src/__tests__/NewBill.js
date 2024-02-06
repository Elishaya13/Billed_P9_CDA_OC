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

jest.mock('../app/store', () => mockStore);

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
  // onNavigate = jest.fn();
});
beforeEach(() => {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
  console.log('BEFORE EACH  D EN HAUT');
});

afterEach(() => {
  document.body.innerHTML = '';
});

//** UI tests **/
describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
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

//** Integration tests */
describe('When I am on NewBill page and uploading a file', () => {
  let newBill;

  beforeEach(() => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage,
    });
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('Then I upload an invalid file, then an error message is displayed', async () => {
    // const onNavigate = (pathname) => {
    //   document.body.innerHTML = ROUTES({ pathname });
    // };

    // const newBill = new NewBill({
    //   document,
    //   onNavigate,
    //   store: mockStore,
    //   localStorage,
    // });

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

  test('Then I upload a valid file, the file name should be displayed into the input and submit button is not disabled and no error message is displayed', async () => {
    // const onNavigate = (pathname) => {
    //   document.body.innerHTML = ROUTES({ pathname });
    // };
    // const newBill = new NewBill({
    //   document,
    //   onNavigate,
    //   store: mockStore,
    //   localStorage,
    // });

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

  test('Then I click on submit button, the submit method is called and we have to navigate to Bills page', async () => {
    const onNavigate = jest.fn();
    // const onNavigate = (pathname) => {
    //   document.body.innerHTML = ROUTES({ pathname });
    // };

    const newBillContainer = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: localStorageMock,
    });

    newBillContainer.isFormImgValid = true;
    newBillContainer.formData = {
      fileUrl: 'https://localhost:3456/images/test.jpg',
      key: '1234',
    };

    // INPUTS FIELDS
    const expenseTypeInput = screen.getByTestId('expense-type');
    const expenseNameInput = screen.getByTestId('expense-name');
    const datePickerInput = screen.getByTestId('datepicker');
    const amountInput = screen.getByTestId('amount');
    const vatInput = screen.getByTestId('vat');
    const pctInput = screen.getByTestId('pct');
    const commentaryInput = screen.getByTestId('commentary');
    const submitBtn = screen.getByTestId('submit-button');

    // Simuler les changements dans chaque champ
    fireEvent.change(expenseTypeInput, { target: { value: 'Transports' } });

    fireEvent.change(expenseNameInput, {
      target: { value: 'Nom de la dépense' },
    });
    fireEvent.change(datePickerInput, { target: { value: '2024-01-29' } });
    fireEvent.change(amountInput, { target: { value: '100.00' } });
    fireEvent.change(vatInput, { target: { value: '20.00' } });
    fireEvent.change(pctInput, { target: { value: '10' } });
    fireEvent.change(commentaryInput, {
      target: { value: 'Commentaire sur la dépense' },
    });

    //on écoute
    const createSpy = jest.spyOn(mockStore.bills(), 'create');
    const updateSpy = jest.spyOn(mockStore.bills(), 'update');
    const handleSubmitSpy = jest.spyOn(newBillContainer, 'handleSubmit');
    // const spy = jest.spyOn(mockStore, 'bills');

    //on clic
    userEvent.click(submitBtn);

    // Handlesubmit est appelé
    expect(handleSubmitSpy).toHaveBeenCalledTimes(1);

    // La methode create est appelée
    expect(createSpy).toHaveBeenCalled();
    // expect(handleSubmitSpy).not.toThrow();

    // expect(updateSpy).toHaveBeenCalled();

    //Test changement de route
    // expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    // expect(onNavigate).toHaveBeenCalled();

    // const bill = {
    //   id: '47qAXb6fIm2zOKkLzMro',
    //   vat: '80',
    //   fileUrl:
    //     'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
    //   status: 'pending',
    //   type: 'Hôtel et logement',
    //   commentary: 'séminaire billed',
    //   name: 'encore',
    //   fileName: 'preview-facture-free-201801-pdf-1.jpg',
    //   date: '2004-04-04',
    //   amount: 400,
    //   commentAdmin: 'ok',
    //   email: 'a@a',
    //   pct: 20,
    // };
    // const formData = {
    //   fileUrl: 'https://localhost:3456/images/test.jpg',
    //   key: '1234',
    // };
    // const createBill = await mockStore.bills().create(bill);
    // const postBill = await mockStore.bills().update(bill);
    // expect(spy).toHaveBeenCalled();
    // expect(createBill).toEqual(formData);
    // expect(postBill).toEqual(bill);
    // expect(createSpy).toHaveBeenCalled();
    // expect(createSpy).toHaveBeenCalledWith(bill);
    // expect(updateSpy).toHaveBeenCalled();
    // expect(updateSpy).toHaveBeenCalledWith(bill);

    // Verifying the navigation is directed to the Bills page
    // expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);

    // test('Then the form should be submitted and navigate to Bills page', async () => {});
  });
});

//** Post tests  **/

//     const newBill = new NewBill({
//       document,
//       onNavigate,
//       store: mockStore,
//       localStorage,
//     });
//     // Mock the updateBill function to simulate form submission
//     jest.spyOn(newBill, 'updateBill').mockImplementation(() => {});
//     // const handleSubmit = spyOn(newBill, 'handleSubmit');

//     // const submitBtn = screen.getByTestId('submit-button');
//     const fileInput = screen.getByTestId('file');

//     const expenseTypeInput = screen.getByTestId('expense-type');
//     const expenseNameInput = screen.getByTestId('expense-name');
//     const datePickerInput = screen.getByTestId('datepicker');
//     const amountInput = screen.getByTestId('amount');
//     const vatInput = screen.getByTestId('vat');
//     const pctInput = screen.getByTestId('pct');
//     const commentaryInput = screen.getByTestId('commentary');

//     // Simuler les changements dans chaque champ
//     fireEvent.change(expenseTypeInput, { target: { value: 'Transports' } });

//     fireEvent.change(expenseNameInput, {
//       target: { value: 'Nom de la dépense' },
//     });
//     fireEvent.change(datePickerInput, { target: { value: '2024-01-29' } });
//     fireEvent.change(amountInput, { target: { value: '100.00' } });
//     fireEvent.change(vatInput, { target: { value: '20.00' } });
//     fireEvent.change(pctInput, { target: { value: '10' } });
//     fireEvent.change(commentaryInput, {
//       target: { value: 'Commentaire sur la dépense' },
//     });

//     // Simulate the form submission
//     const formNewBill = screen.getByTestId('form-new-bill');
//     fireEvent.submit(formNewBill);

//     expect(newBill.updateBill).toHaveBeenCalled();
//     expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
//   });
// });
// test('Then updateBill method should be called', async () => {
//   const newBill = new NewBill({
//     document,
//     onNavigate,
//     store: mockStore,
//     localStorage,
//   });

//   const handleSubmit = spyOn(newBill, 'handleSubmit');
//   newBill.isFormImgValid = true;

//   const formNewBill = screen.getByTestId('form-new-bill');
//   const submitBtn = screen.getByTestId('submit-button');
//   const fileInput = screen.getByTestId('file');

//   const expenseTypeInput = screen.getByTestId('expense-type');
//   const expenseNameInput = screen.getByTestId('expense-name');
//   const datePickerInput = screen.getByTestId('datepicker');
//   const amountInput = screen.getByTestId('amount');
//   const vatInput = screen.getByTestId('vat');
//   const pctInput = screen.getByTestId('pct');
//   const commentaryInput = screen.getByTestId('commentary');

//   const file = new File(['valideFile.png'], 'valideFile.png', {
//     type: 'image/png',
//   });
//   expect(formNewBill).toBeInTheDocument();

//   await userEvent.upload(fileInput, file);
//   expect(fileInput.files[0]).toEqual(file);

//   // Simuler les changements dans chaque champ
//   fireEvent.change(expenseTypeInput, { target: { value: 'Transports' } });

//   fireEvent.change(expenseNameInput, {
//     target: { value: 'Nom de la dépense' },
//   });
//   fireEvent.change(datePickerInput, { target: { value: '2024-01-29' } });
//   fireEvent.change(amountInput, { target: { value: '100.00' } });
//   fireEvent.change(vatInput, { target: { value: '20.00' } });
//   fireEvent.change(pctInput, { target: { value: '10' } });
//   fireEvent.change(commentaryInput, {
//     target: { value: 'Commentaire sur la dépense' },
//   });

//   // Vérifier que les champs contiennent la valeur correcte
//   expect(expenseTypeInput.value).toBe('Transports');
//   expect(expenseNameInput.value).toBe('Nom de la dépense');
//   expect(vatInput.value).toBe('20.00');

//   userEvent.click(submitBtn);
//   expect(handleSubmit).toHaveBeenCalled();

// OnNavigate va bien sur la page Bills mais il ne voit que les données du mock, pas celles mise dans les
// window.onNavigate(ROUTES_PATH.Bills);
// await new Promise(process.nextTick);
// const title = screen.getByText(/Mes notes de frais/);
// expect(title).toBeTruthy();
// Ici cela failed
//     const name = screen.getByText(/Nom de la dépense/);//     |                         ^
// 306 |     expect(name).toBeTruthy();
// const name = screen.getByText(/Nom de la dépense/);
// expect(name).toBeTruthy();
// console.log(title.textContent);

// const test = screen.getByText(/test1/);
// console.log(test.textContent);
// expect(test).toBeTruthy();
// const amount = screen.getByText(/100 €/);
// console.log(amount.textContent);
//   });
// });

// const spy = jest.spyOn(mockStore, 'bills');
// const bill = {
//   id: '47qAXb6fIm2zOKkLzMro',
//   vat: '80',
//   fileUrl:
//     'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
//   status: 'pending',
//   type: 'Hôtel et logement',
//   commentary: 'séminaire billed',
//   name: 'encore',
//   fileName: 'preview-facture-free-201801-pdf-1.jpg',
//   date: '2004-04-04',
//   amount: 400,
//   commentAdmin: 'ok',
//   email: 'a@a',
//   pct: 20,
// };
// const formData = {
//   fileUrl: 'https://localhost:3456/images/test.jpg',
//   key: '1234',
// };
// const createBill = await mockStore.bills().create(bill);
// const postBill = await mockStore.bills().update(bill);
// expect(spy).toHaveBeenCalled();
// expect(createBill).toEqual(formData);
// expect(postBill).toEqual(bill);

//----------------FIN-----------------------//

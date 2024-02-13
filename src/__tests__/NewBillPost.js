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
import NewBillUI from '../views/NewBillUI.js';
import { bills } from '../fixtures/bills.js';

import router from '../app/Router.js';

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

  beforeEach(() => {
    // Create a root element for rendering and append it to the document
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.append(root);

    // Set up the router and navigate to the NewBills page
    // router();
    // document.body.innerHTML = NewBillUI();

    // window.onNavigate(ROUTES_PATH.NewBill);
  });
  afterEach(() => {
    jest.resetAllMocks();
    document.body.innerHTML = '';
  });

  describe('When I submit the form', () => {
    test('Then I click on submit button, the submit method is called and we have to navigate to Bills page', async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBillContainer = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Recupérer des données depuis la fixture bills
      const dataInput = bills[0];

      // newBillContainer.isFormImgValid = true;
      // newBillContainer.formData = {
      //   fileUrl: 'https://localhost:3456/images/test.jpg',
      //   key: '1234',
      // };
      // newBillContainer.fileName = 'preview-facture-free-201801-pdf-1.jpg';

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

      //on écoute
      const handleChangeFile = spyOn(newBillContainer, 'handleChangeFile');
      const handleSubmitSpy = jest.spyOn(newBillContainer, 'handleSubmit');
      const createSpy = jest.spyOn(mockStore.bills(), 'create');
      const updateSpy = jest.spyOn(mockStore.bills(), 'update');
      // const spy = jest.spyOn(mockStore, 'bills');

      // Remplir le champ fichier avec un fichier
      const file = new File(['fileContent'], dataInput.fileName, {
        type: 'image/jpg',
      });
      await userEvent.upload(fileInput, file);
      // ajouter une image au formulaire
      // fireEvent.change(fileInput, { target: { files: [file] } });

      // Apres upload d'un bon fichier isformvalid devrait etre mis a true
      // Vérification que la variable isFormImgValid est à true

      const { isFormImgValid } = newBillContainer;

      console.log('isFormImgValid apres l upload:', isFormImgValid); // <---- N'est pas mis a jour

      // RETOURNE false le par defaut mais pourtant passe dans le true !!! <-----------
      // Vérification finale que la variable isFormImgValid est à true
      // expect(handleChangeFile).toHaveBeenCalled();
      // expect(handleChangeFile).not.toThrow();
      // expect(isFormImgValid).toBe(true);

      // Remplir les champs avec les données du tableau
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

      // petit test de l'ui
      expect(form).toBeInTheDocument();
      expect(commentaryInput.value).toBe('séminaire billed');

      // Resultat du fichier uploadé attendu
      expect(fileInput.files[0]).toEqual(file);

      // Verification que la methode upload appelé
      expect(handleChangeFile).toHaveBeenCalled(); // <--- TEST ECHOUE

      // try {
      //   //on clic
      //   userEvent.click(submitBtn, { event: { preventDefault: jest.fn() } });
      // } catch (error) {
      //   console.error(error);
      // }

      // On soumet le formulaire
      // fireEvent.submit(form); // ???
      userEvent.click(submitBtn);

      // Handlesubmit est appelé
      expect(handleSubmitSpy).toHaveBeenCalled();
      // La methode create est appelée
      expect(createSpy).toHaveBeenCalled();
      expect(handleSubmitSpy).not.toThrow();

      // Handlesubmit est appelé
      // expect(handleSubmitSpy).toHaveBeenCalledTimes(1);

      // La methode create est appelée
      // expect(createSpy).toHaveBeenCalled();
      // expect(handleSubmitSpy).not.toThrow();
    });
  });
});

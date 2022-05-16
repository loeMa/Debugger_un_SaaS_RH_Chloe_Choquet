/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import {fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills";


import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be hightlighted", async() => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      expect(mailIcon.classList.contains('active-icon')).toBe(true)

      
    })
  })

  describe("When I 'm on Newbill page ", () =>{

    test("Then the new bill's form should be loaded with its fields", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByRole("button")).toBeTruthy();
  })
    test('Then I select a wrong IMG format ', async() =>{
      const html = NewBillUI()
      document.body.innerHTML = html
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({});
          },
        };
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newbill = new NewBill({
        document,
        onNavigate, 
        store : mockStore, 
        bills,
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newbill.handleChangeFile);
      const upload = screen.getByTestId('file');
      const file = new File(["file"], "file.pdf", { type: "application/pdf" })
      expect(upload).toBeTruthy()

      upload.addEventListener("change", handleChangeFile);
      fireEvent.change(upload, {
        target: {
            files: [file],
        },
      }); 
      await waitFor(() => screen.getByText("Veuillez télécharger en format JPG, JPEG ou PNG")) 

      expect(handleChangeFile).toHaveBeenCalled();
      expect(upload.files[0].name).toBe("file.pdf");
      expect(screen.getByText('Veuillez télécharger en format JPG, JPEG ou PNG')).toBeVisible()
    }) 
    test('Then I select a right IMG format ', async() =>{
      const html = NewBillUI()
      document.body.innerHTML = html
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({});
          },
        };
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newbill = new NewBill({
        document,
        onNavigate, 
        store : mockStore, 
        bills,
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(newbill.handleChangeFile);
      const upload = screen.getByTestId('file');
      const file = new File(["file"], "file.jpg", { type: "image/jpg" })
      expect(upload).toBeTruthy()

      upload.addEventListener("change", handleChangeFile);
      fireEvent.change(upload, {
        target: {
            files: [file],
        },
      }); 
      expect(handleChangeFile).toHaveBeenCalled();
      expect(upload.files[0].name).toBe("file.jpg");
      expect(screen.getByText('Veuillez télécharger en format JPG, JPEG ou PNG')).not.toBeVisible()
    })

    test('Then the new bill is submit', async() =>{

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a",
      }))

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newbill = new NewBill({
        document,
        onNavigate, 
        store : null, 
        localStorage: window.localStorage
      })

      const html = NewBillUI()
      document.body.innerHTML = html

      const handleSubmit = jest.fn((e) => newbill.handleSubmit(e) )
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled();
    })
    
    test("Then it should renders employee dashboard page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  })
})
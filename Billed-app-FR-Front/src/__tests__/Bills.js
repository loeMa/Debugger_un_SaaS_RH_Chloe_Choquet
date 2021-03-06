/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js"


import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
describe("When I am on Bills page with an error", () => {
  test("Then Error page should be displayed", () => {

      const html = BillsUI({ data: bills, error: true });
      document.body.innerHTML = html;
      const error = screen.getAllByText("Erreur");
      
      expect(error).toBeTruthy();
  })
}) 

describe("When on the Dashboard and I click on eye icon", () => {
  test("Then a modal should be open", async () => {
  
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    const billContainer = new Bills({
      document, 
      onNavigate, 
      store: null, 
      localStorage: localStorageMock
    })

    const html = BillsUI({ data: bills })
    document.body.innerHTML = html

    $.fn.modal = jest.fn();
    const handleClickIconEye  = jest.fn((e) => billContainer.handleClickIconEye(e.target))

    const eyeIcon = screen.getAllByTestId('icon-eye')[0];
    expect(eyeIcon).toBeTruthy();
    eyeIcon.addEventListener('click', handleClickIconEye)
    fireEvent.click(eyeIcon)

    expect(handleClickIconEye).toHaveBeenCalled()
    expect(screen.getAllByText('Justificatif')).toBeTruthy()
    
  })
})


describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard/Bills page", () => {
    test("Then the Bills are show", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
    test("Then the newBills button is show", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      const billContainer = new Bills({
        document, 
        onNavigate, 
        store: null, 
        localStorage: localStorageMock
      })

      window.onNavigate(ROUTES_PATH.Bills)
      const button = screen.getByTestId("btn-new-bill")
      expect(button).toBeTruthy()

      const handleClickNewBill = jest.fn(billContainer.handleClickNewBill);
      button.addEventListener('click', handleClickNewBill)
      fireEvent.click(button)
      expect(handleClickNewBill).toHaveBeenCalled()

    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("then fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message =  await waitFor(() => screen.getByText(/Erreur 404/))
        expect(message).toBeTruthy()
      })

      test("Then fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message =  await waitFor(() => screen.getByText(/Erreur 500/))
        expect(message).toBeTruthy()
      })
      
    })

  })
})

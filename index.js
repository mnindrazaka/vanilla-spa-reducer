let state = {
  hash: window.location.hash,
  inputValue: localStorage.getItem("inputValue") ?? "",
  loading: false,
  products: [],
};

function setState(newState) {
  const prevState = { ...state };
  const nextState = { ...state, ...newState };
  state = nextState;
  render();
  onStateChange(prevState, nextState);
}

function reducer(prevState, action) {
  switch (action.type) {
    case "FETCH": {
      return { ...prevState, loading: true };
    }
    case "FETCH_SUCCESS": {
      return {
        ...prevState,
        loading: false,
        products: action.payload.products,
      };
    }
    case "CHANGE_INPUT": {
      return { ...prevState, inputValue: action.payload.inputValue };
    }
    case "CLEAR_INPUT": {
      return { ...prevState, inputValue: "" };
    }
    case "NAVIGATE_PAGE": {
      return { ...prevState, hash: action.payload.hash };
    }
  }
}

function send(action) {
  const newState = reducer(state, action);
  setState(newState);
}

function onStateChange(prevState, nextState) {
  if (prevState.path !== nextState.path) {
    history.pushState(null, "", nextState.path);
  }

  if (prevState.inputValue !== nextState.inputValue) {
    localStorage.setItem("inputValue", nextState.inputValue);
  }

  if (prevState.loading === false && nextState.loading === true) {
    fetch("https://dummyjson.com/products/search?q=" + state.inputValue)
      .then((res) => res.json())
      .then((data) =>
        send({ type: "FETCH_SUCCESS", payload: { products: data.products } })
      );
  }
}

function Link(props) {
  const a = document.createElement("a");
  a.href = props.href;
  a.textContent = props.label;
  a.onclick = function (event) {
    event.preventDefault();
    const url = new URL(event.target.href);
    send({ type: "NAVIGATE_PAGE", payload: { hash: url.hash } });
  };
  return a;
}

function Navbar() {
  const linkHome = Link({ href: "#home", label: "Home" });
  const linkAbout = Link({ href: "#about", label: "About" });

  const div = document.createElement("div");
  div.append(linkHome);
  div.append(linkAbout);

  return div;
}

function ProductItem(props) {
  const titleText = document.createElement("p");
  titleText.textContent = props.title;
  return titleText;
}

function ProductList() {
  const items = state.products.map((product) =>
    ProductItem({ title: product.title })
  );

  const loadingText = document.createElement("p");
  loadingText.textContent = "Loading Products...";

  const emptyText = document.createElement("p");
  emptyText.textContent = "Product Empty";

  const div = document.createElement("div");

  if (state.loading) {
    div.append(loadingText);
  } else if (state.products.length == 0) {
    div.append(emptyText);
  } else {
    div.append(...items);
  }

  return div;
}

function ProductSearchInput() {
  const input = document.createElement("input");
  input.id = "input";
  input.value = state.inputValue;
  input.placeholder = "enter your name";
  input.disabled = state.loading;
  input.oninput = function (event) {
    send({ type: "CHANGE_INPUT", payload: { inputValue: event.target.value } });
  };

  const buttonClear = document.createElement("button");
  buttonClear.textContent = "Clear";
  buttonClear.disabled = state.loading;
  buttonClear.onclick = function () {
    send({ type: "CLEAR_INPUT" });
  };

  const buttonSubmit = document.createElement("button");
  buttonSubmit.textContent = "Submit";
  buttonSubmit.disabled = state.loading;
  buttonSubmit.onclick = function () {
    send({ type: "FETCH" });
  };

  const div = document.createElement("div");
  div.append(input);
  div.append(buttonClear);
  div.append(buttonSubmit);

  return div;
}

function HomePage() {
  const navbar = Navbar();

  const p = document.createElement("p");
  p.textContent = "Welcome to Home Page";

  const textPreview = document.createElement("p");
  textPreview.textContent = state.inputValue;

  const div = document.createElement("div");
  div.append(navbar);
  div.append(p);
  div.append(ProductSearchInput());
  div.append(textPreview);
  div.append(ProductList());

  return div;
}

function AboutPage() {
  const linkHome = Link({ href: "#home", label: "Back to Home" });

  const p = document.createElement("p");
  p.textContent = "Welcome to About Page";

  const div = document.createElement("div");
  div.appendChild(linkHome);
  div.appendChild(p);
  return div;
}

function App() {
  const homePage = HomePage();
  const aboutPage = AboutPage();

  if (state.hash == "#home") {
    return homePage;
  } else if (state.hash == "#about") {
    return aboutPage;
  } else {
    return homePage;
  }
}

function render() {
  const focusedElementId = document.activeElement.id;
  const focusedElementSelectionStart = document.activeElement.selectionStart;
  const focusedElementSelectionEnd = document.activeElement.selectionEnd;

  const root = document.getElementById("root");
  const app = App();
  root.innerHTML = "";
  root.appendChild(app);

  if (focusedElementId) {
    const focusedElement = document.getElementById(focusedElementId);
    focusedElement.focus();
    focusedElement.selectionStart = focusedElementSelectionStart;
    focusedElement.selectionEnd = focusedElementSelectionEnd;
  }
}

render();
send({ type: "FETCH" });

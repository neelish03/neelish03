"use strict";

const GITHUB_USERNAME = "neelish03";

const $ = (selector, root = document) => root.querySelector(selector);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

const themeButton = $("#theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeButton.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  try {
    localStorage.setItem("theme", theme);
  } catch (err) {
  }
}

applyTheme(document.documentElement.getAttribute("data-theme") || "light");

themeButton.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

const menuButton = $("#menu-toggle");
const navLinks = $("#nav-links");

menuButton.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

function buildProjectCard(project) {
  const shot = el("div", { class: "shot" },
    el("span", { class: "shot-letter", "aria-hidden": "true" }, project.title.charAt(0))
  );

  const image = el("img", {
    src: `images/${project.screenshot}`,
    alt: `Screenshot of ${project.title}`,
    loading: "lazy"
  });
  image.addEventListener("error", () => image.remove());
  shot.append(image);

  const tech = el("ul", { class: "tech", "aria-label": "Technologies used" },
    ...project.technologies.map((name) => el("li", {}, name))
  );

  const link = el("a", {
    class: "card-link",
    href: project.link,
    target: "_blank",
    rel: "noopener"
  }, project.linkLabel || "View on GitHub");

  const body = el("div", { class: "card-body" },
    el("h3", {}, project.title),
    tech,
    el("p", {}, project.description),
    el("p", { class: "role" }, el("strong", {}, "My role: "), project.role),
    link
  );

  return el("article", { class: "project-card" }, shot, body);
}

async function loadProjects() {
  const grid = $("#project-grid");
  try {
    const response = await fetch("projects.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error("No projects found in the file");
    }

    grid.replaceChildren(...projects.map(buildProjectCard));
  } catch (err) {
    console.warn("Could not load projects:", err.message);
    grid.replaceChildren(
      el("p", { class: "status is-error" },
        "Projects could not be loaded. Please refresh the page or try again later.")
    );
  }
}

async function loadRepos() {
  const list = $("#repo-list");
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const repos = await response.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      throw new Error("No public repositories found");
    }

    const items = repos.map((repo) =>
      el("li", {},
        el("a", { href: repo.html_url, target: "_blank", rel: "noopener" }, repo.name),
        el("span", { class: "repo-lang" }, repo.language || "No main language")
      )
    );
    list.replaceChildren(...items);
  } catch (err) {
    console.warn("Could not load GitHub repositories:", err.message);
    list.replaceChildren(
      el("li", { class: "status is-error" },
        "GitHub data is unavailable right now. Please try again later.")
    );
  }
}

const form = $("#contact-form");
const thanks = $("#form-thanks");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(input, message) {
  const field = input.closest(".field");
  $(`#${input.id}-error`).textContent = message;
  field.classList.toggle("has-error", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateForm() {
  const name = form.elements.name;
  const email = form.elements.email;
  const message = form.elements.message;
  let valid = true;

  if (name.value.trim() === "") {
    setError(name, "Please enter your name.");
    valid = false;
  } else {
    setError(name, "");
  }

  if (email.value.trim() === "") {
    setError(email, "Please enter your email address.");
    valid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    setError(email, "Please enter a valid email address, like name@example.com.");
    valid = false;
  } else {
    setError(email, "");
  }

  if (message.value.trim() === "") {
    setError(message, "Please write a message.");
    valid = false;
  } else {
    setError(message, "");
  }

  return valid;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  thanks.hidden = true;

  if (validateForm()) {

    form.reset();
    thanks.hidden = false;
  }
});

form.addEventListener("input", (event) => {
  if (event.target.id) setError(event.target, "");
});

$("#year").textContent = new Date().getFullYear();
loadProjects();
loadRepos();
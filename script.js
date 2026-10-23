
document.addEventListener("DOMContentLoaded", () => {
  const projectGrid = document.getElementById("projectGrid");
  const skillsList = document.getElementById("skillsList");
  const workingGrid = document.getElementById("workingGrid");

  document.getElementById("year").textContent = new Date().getFullYear();

  const today = document.getElementById("today");
  if (today) {
    today.textContent = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach(item => {
        item.classList.remove("active");
      });
      link.classList.add("active");
    });
  });

  loadPortfolioData();

  async function loadPortfolioData() {
    try {
      const response = await fetch("data.json", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Could not load data.json (HTTP ${response.status})`);
      }

      const data = await response.json();

      const projects = Array.isArray(data.projects) ? data.projects : [];
      const skills = Array.isArray(data.skills) ? data.skills : [];
      const workingOn = Array.isArray(data.workingOn) ? data.workingOn : [];

      renderProjects(projects);
      renderSkills(skills);
      renderWorkingOn(workingOn);

      document.getElementById("projectCount").textContent = projects.length;
      document.getElementById("skillCount").textContent = skills.length;
      document.getElementById("workingCount").textContent = workingOn.length;
    } catch (error) {
      console.error("Portfolio data error:", error);
      showError(projectGrid, "Unable to load projects. Check that data.json is valid and in the same folder.");
      showError(skillsList, "Unable to load skills. Check data.json.");
      showError(workingGrid, "Unable to load current goals. Check data.json.");
      document.getElementById("skillsLoading").textContent = "";
    }
  }

  function renderProjects(projects) {
    projectGrid.replaceChildren();

    if (projects.length === 0) {
      showError(projectGrid, "No projects added yet.");
      return;
    }

    projects.forEach(project => {
      const card = document.createElement("article");
      card.className = "project-card";

      const top = document.createElement("div");
      top.className = "project-top";

      const icon = document.createElement("div");
      icon.className = "project-icon";
      icon.textContent = project.icon || "🌸";

      const titleArea = document.createElement("div");

      const title = document.createElement("h3");
      title.className = "project-title";
      title.textContent = project.title || "Untitled project";

      const status = document.createElement("span");
      status.className = "status";
      status.textContent = project.status || "In progress";

      titleArea.append(title, status);
      top.append(icon, titleArea);

      const description = document.createElement("p");
      description.textContent = project.description || "";

      const tags = document.createElement("div");
      tags.className = "tags";

      (Array.isArray(project.technologies) ? project.technologies : []).forEach(technology => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = technology;
        tags.appendChild(tag);
      });

      card.append(top, description, tags);

      if (project.link && isSafeHttpUrl(project.link)) {
        const link = document.createElement("a");
        link.className = "project-link";
        link.href = project.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View project ↗";
        card.appendChild(link);
      }

      projectGrid.appendChild(card);
    });
  }

  function renderSkills(skills) {
    skillsList.replaceChildren();
    document.getElementById("skillsLoading").textContent = "";

    if (skills.length === 0) {
      showError(skillsList, "No coding skills added yet.");
      return;
    }

    skills.forEach(skill => {
      const level = Math.max(0, Math.min(100, Number(skill.level) || 0));

      const item = document.createElement("div");
      item.className = "skill-item";

      const info = document.createElement("div");
      info.className = "skill-info";

      const name = document.createElement("strong");
      name.textContent = skill.name || "Unnamed skill";

      const percentage = document.createElement("span");
      percentage.textContent = `${level}%`;

      const track = document.createElement("div");
      track.className = "skill-track";
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-label", skill.name || "Coding skill");
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
      track.setAttribute("aria-valuenow", String(level));

      const fill = document.createElement("div");
      fill.className = "skill-fill";
      fill.style.width = `${level}%`;

      info.append(name, percentage);
      track.appendChild(fill);
      item.append(info, track);
      skillsList.appendChild(item);
    });
  }

  function renderWorkingOn(items) {
    workingGrid.replaceChildren();

    if (items.length === 0) {
      showError(workingGrid, "No current goals added yet.");
      return;
    }

    items.forEach(goal => {
      const card = document.createElement("article");
      card.className = "working-card";

      const icon = document.createElement("div");
      icon.className = "working-icon";
      icon.textContent = goal.icon || "🌱";

      const title = document.createElement("h3");
      title.textContent = goal.title || "Current goal";

      const status = document.createElement("span");
      status.className = "status";
      status.textContent = goal.status || "Currently learning";

      const description = document.createElement("p");
      description.textContent = goal.description || "";

      card.append(icon, title, status, description);
      workingGrid.appendChild(card);
    });
  }

  function showError(container, message) {
    if (!container) return;

    container.replaceChildren();
    const paragraph = document.createElement("p");
    paragraph.className = "error-message";
    paragraph.textContent = message;
    container.appendChild(paragraph);
  }

  function isSafeHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }
});

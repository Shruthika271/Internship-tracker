let applications =
JSON.parse(localStorage.getItem("applications")) || [];
let editingId = null;

const form = document.querySelector("#application-form");
const searchInput = document.querySelector("#search");
const statusFilter = document.querySelector("#status-filter");
const locationFilter = document.querySelector("#location-filter");
const sortFilter = document.querySelector("#sort-filter");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");


const textFields = [
    document.querySelector("#company"),
    document.querySelector("#role"),
    document.querySelector("#location")
];

textFields.forEach(function(field) {
    field.addEventListener("input", function() {
        field.value = field.value.replace(/\b\w/g, function(letter) {
            return letter.toUpperCase();
        });
    });
});


const formFields = [
    document.querySelector("#company"),
    document.querySelector("#role"),
    document.querySelector("#location"),
    document.querySelector("#deadline"),
    document.querySelector("#status")
];

formFields.forEach(function(field, index) {
    field.addEventListener("keydown", function(event) {

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        if (!field.value.trim()) {
            field.setCustomValidity("Please enter this field before continuing.");
            field.reportValidity();

            field.addEventListener("input", function clearError() {
                field.setCustomValidity("");
                field.removeEventListener("input", clearError);
            });
            return;
        }

        if (index < formFields.length - 1) {
            formFields[index + 1].focus();
        } else {
            form.requestSubmit();
        }
    });
});


form.addEventListener("submit", function(event) {
    event.preventDefault();

    const company = document.querySelector("#company").value.trim();
    const role = document.querySelector("#role").value.trim();
    const location = document.querySelector("#location").value.trim();
    const deadline = document.querySelector("#deadline").value;
    const status = document.querySelector("#status").value;
    
    if (!company || !role || !location || !deadline) {
        return;
    }

    if (editingId === null) {
        const application = {
            id: Date.now(),
            company: company,
            role: role,
            location: location,
            deadline: deadline,
            status: status,
            createdAt: new Date().toISOString()
        };
        
        applications.push(application);
        
    } else {
        applications = applications.map(function(application) {
            if (application.id === editingId) {
                return {
                    id: application.id,
                    company: company,
                    role: role,
                    location: location,
                    deadline: deadline,
                    status: status,
                    createdAt: application.createdAt
                };
            }
            
            return application;
        });
        
        editingId = null;
        submitButton.textContent = "Add Application";
        cancelEditButton.hidden = true;
    }
    

    saveApplications();
    form.reset();
    displayApplications();
    updateDashboard();
    updateLocationFilter();
    
});

searchInput.addEventListener("input", function() {
    displayApplications();
});

statusFilter.addEventListener("change", function() {
    displayApplications();
});

locationFilter.addEventListener("change", function() {
    displayApplications();
});

sortFilter.addEventListener("change", function() {
    displayApplications();
});

cancelEditButton.addEventListener("click", function() {
    form.reset();
    editingId = null;
    submitButton.textContent = "Add Application";
    cancelEditButton.hidden = true;
});

function saveApplications() {
    localStorage.setItem("applications", JSON.stringify(applications));
}


function getDeadlineInfo(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);

    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const difference = deadlineDate - today;
    const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
        return {
            text: "Deadline passed",
            className: "deadline-passed"
        };
    }

    if (daysLeft === 0) {
        return {
            text: "Due today",
            className: "deadline-soon"
        };
    }

    if (daysLeft <= 3) {
        return {
            text: daysLeft + " days left",
            className: "deadline-soon"
        };
    }

    return {
        text: daysLeft + " days left",
        className: "deadline-normal"
    };   
}


function getStatusClass(status) {
    return "status-" + status.toLowerCase();
}


function displayApplications() {
    
    const list = document.querySelector("#applications-list");
    
    list.innerHTML = "";
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const selectedLocation = locationFilter.value;
    const selectedSort = sortFilter.value;
    
    let filteredApplications = applications.filter(function(application) {
        const matchesSearch =
                application.company.toLowerCase().includes(searchTerm) ||
                application.role.toLowerCase().includes(searchTerm) ||
                application.location.toLowerCase().includes(searchTerm);
    
        const matchesStatus =
                selectedStatus === "All" ||
                application.status === selectedStatus;
    
        const matchesLocation =
                selectedLocation === "All" ||
                application.location === selectedLocation;
    
        return matchesSearch && matchesStatus && matchesLocation;
    });


    filteredApplications.sort(function(a, b) {
            if (selectedSort === "company") {
                return a.company.localeCompare(b.company);
            }

            if (selectedSort === "oldest") {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            }

            if (selectedSort === "deadline") {
                return new Date(a.deadline) - new Date(b.deadline);
            }

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });


    if (filteredApplications.length === 0) {
        list.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No applications found.
                </td>
            </tr>
        `;
        return;
    }
    

    filteredApplications.forEach(function(application, index) {

        const row = document.createElement("tr");
        const deadlineInfo = getDeadlineInfo(application.deadline);
        const statusClass = getStatusClass(application.status);


        row.innerHTML = `
           <td>${index + 1}</td>
            <td class="company-name">${application.company}</td>
            <td>${application.role}</td>
            <td>${application.location}</td>
            
            <td class="${deadlineInfo.className}">
                ${application.deadline}<br>
                <small>${deadlineInfo.text}</small>
            </td>
           
            <td>
                <span class="status-badge ${statusClass}">
                    ${application.status}
                </span>
            </td>
           
            <td>
                <button class="edit-button" onclick="editApplication(${application.id})">Edit</button>
                <button class="delete-button" onclick="deleteApplication(${application.id})">Delete</button>
            </td>
        `;

        list.appendChild(row);

    });
}


function editApplication(id) {
    const application = applications.find(function(application) {
        return application.id === id;
    });

    if (!application) {
        return;
    }

    document.querySelector("#company").value = application.company;
    document.querySelector("#role").value = application.role;
    document.querySelector("#location").value = application.location;
    document.querySelector("#deadline").value = application.deadline;
    document.querySelector("#status").value = application.status;

    editingId = id;
    submitButton.textContent = "Update Application";
    cancelEditButton.hidden = false;

    form.scrollIntoView({ behavior: "smooth" });
}


function deleteApplication(id) {

    applications = applications.filter(function(application) {
        return application.id !== id;
    });

    saveApplications();
    displayApplications();
    updateDashboard();
    updateLocationFilter();
}


function updateLocationFilter() {
    const currentLocation = locationFilter.value;

    const locations = [...new Set(
        applications.map(function(application) {
            return application.location;
        })
    )].sort();

    locationFilter.innerHTML = '<option value="All">All Locations</option>';

    locations.forEach(function(location) {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });

    if (locations.includes(currentLocation)) {
        locationFilter.value = currentLocation;
    }
}


function updateDashboard() {

    const total = applications.length;

    const saved = applications.filter(function(application) {
        return application.status === "Saved";
    }).length;

    const applied = applications.filter(function(application) {
        return application.status === "Applied";
    }).length;

    const oa = applications.filter(function(application) {
        return application.status === "OA";
    }).length;

    const interviews = applications.filter(function(application) {
        return application.status === "Interview";
    }).length;

    const offers = applications.filter(function(application) {
        return application.status === "Offer";
    }).length;

    const rejected = applications.filter(function(application) {
        return application.status === "Rejected";
    }).length;

    document.querySelector("#applications-count").textContent = total;
    document.querySelector("#applied-count").textContent = applied;
    document.querySelector("#oa-count").textContent = oa;
    document.querySelector("#interviews-count").textContent = interviews;
    document.querySelector("#offers-count").textContent = offers;
    document.querySelector("#rejected-count").textContent = rejected;

    updateAnalytics("saved", saved, total);
    updateAnalytics("applied", applied, total);
    updateAnalytics("oa", oa, total);
    updateAnalytics("interview", interviews, total);
    updateAnalytics("offer", offers, total);
    updateAnalytics("rejected", rejected, total);
}


function updateAnalytics(status, count, total) {
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

    document.querySelector("#" + status + "-bar").style.width = percentage + "%";
    document.querySelector("#" + status + "-percent").textContent = percentage + "%";
}

updateLocationFilter();
displayApplications();
updateDashboard();
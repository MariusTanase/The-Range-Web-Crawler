// set up the button
let searchButton = document.querySelector(".search");
// set up the input field
let input = document.querySelector('.sku__value');
// set up the output div
let output = document.querySelector("#output");
// set up the error message
let error = document.querySelector(".error");
// set up the sku value
let messageElement = document.querySelector(".message");
//set up the image
let imageContainer = document.querySelector("#image-container");
// clear button
let clearButton = document.querySelector(".clear");
// assortment text
let assortment = document.querySelector(".assortment");

let coll = document.getElementsByClassName("collapsible");

let itemDescription = document.querySelector(".itemDescription");

let price = document.querySelector(".price");

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

searchButton.addEventListener("click", function () {
    checkSkuValue(input.value)
    if (input.value.length > 0) {
        searchButton.disabled = true;
        searchButton.textContent = "Searching...";
        searchButton.classList.add("searching");
    }
});

clearButton.addEventListener("click", function () {
    clearInformation();
});

// Input on enter to start the search
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {

        checkSkuValue(input.value);
        if (input.value.length > 0) {
            searchButton.disabled = true;
            searchButton.textContent = "Searching...";
            searchButton.classList.add("searching");

        }

    }
})

function checkSkuValue(sku) {
    sku.trim();
    clearInformation()
    let value = parseInt(sku);
    if (value === "" || value === null || value === undefined || isNaN(value) || value < 1) {
        error.textContent = "Please enter a value";
    } else {
        error.textContent = "";
        getApiData(value);
    }
}


const getApiData = async (sku) => {
    let response = await fetch(`http://localhost:3001/api/${sku}`);
    let data = await response.json();

    if (data.status == 404) {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
        searchButton.classList.remove("searching");
        return error.textContent = data.message;
    } else {
        error.textContent = "";
        displayData(data);
    }
}

let ul = document.querySelector(".specifications");
let createList = (data) => {
    let li = document.createElement("li");
    li.classList.add("specification");
    li.textContent = data;
    ul.appendChild(li);
}



// function to display the data on the page
let displayData = (data) => {

    searchButton.disabled = false;
    searchButton.textContent = "Search";
    searchButton.classList.remove("searching");

    // set coll with display block
    let coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].style.display = "block";
    };
    let specifications = data.data.specification;

    if (specifications == null) {
        specifications.style.display = "none";
    } else {
        // specifications its an array    
        specifications.forEach((item) => {
            createList(item);
        });
    }

    // set the price
    if (data.data.price == null) {
        price.textContent = "Price: Not available";
    } else {
        price.textContent = `Price: ${data.data.price}`;
    }

    messageElement.textContent = data.data.title;
    itemDescription.textContent = data.data.itemDescription;
    // if the object inside type is empty, remove from loop
    if (data.data.assortmentText == null || data.data.assortmentText == undefined || data.data.assortmentText == "") {
        assortment.style.display = "none";
    } else {
        assortment.textContent = data.data.assortmentText;
    }

    data.data.images.forEach((item) => {

        // check if the image is empty on different properties
        if (Object.keys(item).length === 0) {
            // remove elements in case of empty image
            return
        }

        // create a new image element
        const image = document.createElement("img");

        image.src = item.image;
        imageContainer.appendChild(image);

        error.textContent = "";
    })

}

// function to clear the output div
function clearInformation() {
    messageElement.textContent = "";
    // remove all the images from output
    imageContainer.innerHTML = "";
    assortment.textContent = "";
    searchButton.disabled = false;
    let coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].style.display = "none";
    };
}
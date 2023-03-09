// Global Variable
const seeAllBtn = document.getElementById("see-all");
let sortedArray = [];

// onload handler
window.onload = () => {
  showSpinner(true);
  main();
  loadData();
};

// This function will take care of getting all the DOM references
function main() {
  // Dom References
  const sortByDateBtn = document.getElementById("sort-date-btn"),
    defaultOrder = document.getElementById("default"),
    ascendingOrder = document.getElementById("ascending"),
    descendingOrder = document.getElementById("descending");

  // event listeners
  seeAllBtn.addEventListener("click", () => {
    showAllCard();

    // reset innerText of button
    let sortingMethod = document.getElementById("sorting-method");
    sortingMethod.innerText = "";
    sortingMethod.innerText = "Default";
  });

  sortByDateBtn.addEventListener("click", () => {
    showDropdownOptions(null);
  });

  ascendingOrder.addEventListener("click", (e) => {
    sortByDate((a, b) => {
      return (
        new Date(a.published_in).valueOf() - new Date(b.published_in).valueOf()
      );
    });
    showDropdownOptions(e.target);
  });

  descendingOrder.addEventListener("click", (e) => {
    sortByDate((a, b) => {
      return (
        new Date(b.published_in).valueOf() - new Date(a.published_in).valueOf()
      );
    });
    showDropdownOptions(e.target);
  });

  defaultOrder.addEventListener("click", (e) => {
    sortByDate((a, b) => {
      return a.id - b.id;
    });
    showDropdownOptions(e.target);
  });
}

/**
-----------------
  FETCH API
-----------------
*/
/**
 * If you want to show all cards then give true otherwise give false
 * @param {Boolean} isShow
 */
const loadData = async (isShow = false) => {
  try {
    const res = await fetch(
      "https://openapi.programming-hero.com/api/ai/tools"
    );
    const data = await res.json();
    displayData(data.data.tools, isShow);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Single data details
 * @param {Number} id
 */
const loadModalData = async (id) => {
  try {
    const res = await fetch(
      `https://openapi.programming-hero.com/api/ai/tool/${id}`
    );
    const data = await res.json();
    displayModalData(data.data);
  } catch (error) {
    console.log(error);
  }
};

/**
 ------------------
  DOM FUNCTIONS
 ------------------
 */
/**
 * Display card data
 * @param {Array} data
 * @param {Boolean} isShow
 */
const displayData = (data, isShow) => {
  const cardContainer = document.getElementById("card-container");

  cardContainer.innerHTML = "";

  if (!isShow) {
    data = data.slice(0, 6);
  }

  // deep clone on data array
  sortedArray = JSON.parse(JSON.stringify(data));

  data.forEach((element, i) => {
    let { id, name, image, published_in: date, features } = element;
    let div = document.createElement("div");
    div.classList.add("border", "rounded-lg", "p-3", "lg:p-5");

    div.innerHTML = `
        <div>
            <div class='h-60 overflow-hidden rounded-lg'>
              <img src="${image}" alt="" class=' transform duration-300 hover:scale-110 w-full h-full '/>
            </div>
          </div>
          <div class="mt-5">
            <div>
              <h3>Feature</h3>
              <ul class='feature-list my-3'></ul>
            </div>
            <hr />
            <div class="flex items-center justify-between mt-5">
              <div>
                <h3 class="mb-2">${name}</h3>
                <span class="mr-2"
                  ><i class="fa-solid fa-calendar-days"></i
                ></span>
                <span>${date}</span>
              </div>
              <div>
                <button class="text-[#EB5757] bg-[#f6e8e8] rounded-full" onclick="loadModalData('${id}')">
                  <i class="fa-solid fa-arrow-right p-4 rounded-full"></i>
                </button>
              </div>
            </div>
        </div>
        `;

    cardContainer.appendChild(div);

    // create ul li
    const ul = document.getElementsByClassName("feature-list")[i];
    createListItems(features, ul, true, i);
  });

  // hide spinner
  showSpinner(false);

  // handle innerText of see all button
  if (isShow) {
    toggleText(true, "Hide");
  } else {
    toggleText(true, "See All");
  }
};

/**
 * Display Data in Modal
 * @param {Array} data
 */
const displayModalData = (data) => {
  const modal = document.getElementById("modal-container");
  modal.classList.remove("hidden");

  let {
    tool_name: name,
    description,
    image_link: [img],
    features,
    integrations,
    pricing,
    accuracy: { score },
    input_output_examples,
  } = data;
  console.log(features);
  modal.innerHTML = `
  <div class='relative w-11/12 md:w-9/12  md:p-5 p-3 bg-white rounded-lg '>
    <div class="md:flex md:gap-3 h-[525px] md:h-full  overflow-y-auto overflow-x-hidden">
      <div class="bg-[#fef7f7] border rounded-lg px-5 py-4 flex-1">
        <h2 class="text-[#111111] text-xl">
          ${description}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
          <div class="bg-white p-4 rounded-lg">
            <h4 class="text-[#03A30A]">
            ${checkPricing(pricing, "Basic", 0)}
            </h4>
          </div>
          <div class="bg-white p-4 rounded-lg">
            <h4 class="text-[#F28927]">${checkPricing(pricing, "Pro", 1)}</h4>
          </div>
          <div class="bg-white p-4 rounded-lg">
            <h4 class="text-[#EB5757]">
            ${checkPricing(pricing, "Enterprise", 2)}
           </h4>
          </div>
        </div>
        <div class="md:flex gap-3">
          <div>
            <h3>Features</h3>
            <ul class="mt-4 ml-4" style="list-style-type:disc">
              <li>${features[1].feature_name}</li>
              <li>${features[2].feature_name}</li>
              <li>${features[3].feature_name}</li>
            </ul>
          </div>
          <div class='mt-2 md:mt-0'>
            <h3>Integrations</h3>
            <ul class="mt-4 ml-4 integrations-btn" style="list-style-type:disc"></ul>
          </div>
        </div>
      </div>
      <div class="flex-1 text-center border rounded-lg p-5 mt-2 md:mt-0">
        <div class="relative">
          <img src="${img}" alt="${name} image not found" class="w-full rounded-lg" srcset="" />
          <div class="absolute top-2  right-2 ${
            score || "hidden"
          }" id='accuracy'>
            <span
              class="px-2 bg-[#EB5757] text-white font-semibold py-1 px-2 rounded-lg"
              >${score * 100}% accuracy</span
            >
          </div>
        </div>
        <h3 class="mt-5 mb-3">
        ${checkInputOutput(
          input_output_examples,
          0,
          "input",
          "Can you give any example?"
        )}
        </h3>
        <p>
        ${checkInputOutput(
          input_output_examples,
          0,
          "output",
          "No! Not Yet! Take a break!!!"
        )}
       </p>
      </div>
    </div>
    <div
    onclick='closeModal(this)'
      class="absolute md:top-[-15px] md:right-[-15px] top-0 right-0 w-8 h-8 bg-[#ee6c6c] rounded-full"
    >
      <button
        class="absolute top-2/4 left-2/4 translate-x-[-50%] translate-y-[-50%]"
      >
        <i class="fa-solid fa-xmark text-white"></i>
      </button>
    </div>
  </div>
  `;
  const ul = document.querySelector(".integrations-btn");

  createListItems(integrations, ul, false);
};

/**
------------------
  EVENT HANDLERS
------------------
 */
const sortByDate = (callBack) => {
  if (sortedArray.length === 0) return;

  if (callBack) {
    sortedArray.sort(callBack);
  }

  // check user clicked see all button or not
  if (seeAllBtn.innerText.toLowerCase() === "see all") {
    displayData(sortedArray, false);
  } else {
    displayData(sortedArray, true);
  }
};

const showAllCard = () => {
  if (seeAllBtn.innerText.toLowerCase() === "see all") {
    loadData(true);
  } else {
    loadData(false);
  }
};
const showDropdownOptions = (element) => {
  const option = document.getElementById("options");
  option.classList.toggle("hidden");
  document.getElementById("arrow-up").classList.toggle("hidden");
  document.getElementById("arrow-down").classList.toggle("hidden");

  if (element) {
    option.querySelector(".active").classList.remove("active");
    element.classList.add("active");
    let sortingMethod = document.getElementById("sorting-method");
    sortingMethod.innerText = "";
    sortingMethod.innerText = element.innerText;
  }
};
/**
------------------
  UTILS
------------------
 */
/**
 * Show and hide spinner
 * @param {Boolean} isSpin
 */
const showSpinner = (isSpin) => {
  const spinner = document.getElementById("spinner");
  if (isSpin) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
};

/**
 * control innerText of show all button
 * @param {Boolean} isShow
 * @param {String} text
 */
const toggleText = (isShow, text) => {
  if (isShow) {
    seeAllBtn.innerText = text;
    seeAllBtn.classList.remove("hidden");
  } else {
    seeAllBtn.classList.add("hidden");
  }
};

/**
 * Close model
 * @param {String} element
 */
const closeModal = (element) => {
  element.parentElement.parentElement.classList.add("hidden");
};

/**
 * Create li list and append ul tag
 * @param {Array} array
 * @param {String} ul
 * @param {Boolean} isCount
 * @param {Number} i
 */
const createListItems = (array, ul, isCount, i) => {
  let count = 0;
  if (!array) {
    ul.innerHTML = `
    <li>No data Found</li>
    `;
    return;
  }

  array.forEach((element) => {
    ul.innerHTML += `
      <li>${isCount ? ++count + ". " : ""}${element}</li>
      `;
  });
};

/**
 * @param {Array} priceArray
 * @param {String} category
 * @param {Number} index
 * @returns innerHTML of price card
 */
const checkPricing = (priceArray, category, index) => {
  if (priceArray) {
    if (
      priceArray[index].price !== "No cost" &&
      priceArray[index].price !== "0"
    ) {
      return priceArray[index].price + "<br>" + priceArray[index].plan;
    } else {
      return "Free of cost/" + "<br>" + category;
    }
  } else {
    return "Free of cost/" + "<br>" + category;
  }
};

/**
 * @param {String} element
 * @param {Boolean} index
 * @param {String} inputOrOutput
 * @param {String} message
 * @returns input and output message
 */
const checkInputOutput = (element, index, inputOrOutput, message) => {
  return element === null ? message : element[index][inputOrOutput];
};

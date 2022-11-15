/**
 * @description Immutable store for all data. `roverName` is the selected rover after click image.
 * - Credits/attribution: roverImages are from wikipedia
 * 	- https://commons.wikimedia.org/wiki/File:NASA%27s_Curiousity_Mars_Rover.jpg
 * 		- Intel Free Press, CC BY-SA 2.0 <https://creativecommons.org/licenses/by-sa/2.0>, via Wikimedia Commons
 *  - https://commons.wikimedia.org/wiki/File:NASA_Mars_Rover.jpg - menuImage & favicon
 * 		- NASA/JPL/Cornell University, Maas Digital LLC, Public domain, via Wikimedia Commons
 *  - https://commons.wikimedia.org/wiki/File:Spirit-dettagli.jpg
 * 		- The original uploader was Conversion script at Italian Wikipedia., Public domain, via Wikimedia Commons
 */
let store = {
  roverNames: ["Curiosity", "Opportunity", "Spirit"],
  roverName: "",
  roverImages: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/NASA%27s_Curiousity_Mars_Rover.jpg/256px-NASA%27s_Curiousity_Mars_Rover.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/256px-NASA_Mars_Rover.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/46/Spirit-dettagli.jpg",
  ],
  MarsWeatherIframe:
    "<iframe src='https://mars.nasa.gov/layout/embed/image/mslweather/' title='Mars Weather' width='800' height='530'  scrolling='no' frameborder='0'></iframe>",
};

/**
 * @description AppElement holds Instructions initially and Rover Details table after click on Rover image
 */
const appElement = document.getElementById("app");

/**
 * @description update the immutable store with new data
 * @param {object} store - the immutable store
 * @param {object} newState - the new information to store
 * @param {boolean} render - render or not store update
 */
const updateStore = (store, newState, render = false) => {
  store = Object.assign(store, newState);
  if (render) {
    console.log("updateStore: " + JSON.stringify(newState));
    renderApp(appElement, store);
    // console.log("updateStore: " + JSON.stringify(store));
  }
};

/**
 * @description render the App to the app element div in DOM
 * @param {object} appElement - app element div in DOM
 * @param {object} state - local copy of immutable store
 */
const renderApp = async (appElement, state) => {
  appElement.innerHTML = App(state);
  let { roverName } = state;
  if (roverName) {
    addImgTilesToDOM(state);
    addWeatherIframeToDOM(state);
  }
};

/**
 * @description listening for load event and then invoke javascript functions
 */
window.addEventListener("load", async () => {
  await loadRoverData(store);
  renderApp(appElement, store);
  addMenuTilesToDOM(store);
});

// ------------------------------------------------------  HELPER FUNCTIONS

/**
 * @description calculate the ManifestKey for the relevant Rover. This is where the Rover Manifest data is stored.
 */
const manifestKey = (roverName) => `${roverName}Manifest`;

/**
 * @description calculate the PhotosKey for the relevant Rover. This is where the Rover Photos data is stored.
 */
const photosKey = (roverName) => `${roverName}Photos`;

/**
 * @description calculate the current day's dateStamp to store. Used to update Rover data in Store if it is not from today e.g. page load was yesterday.
 * @returns {string} the current day's dateStamp to store
 */
const dateStamp = () => new Date().toISOString().split("T")[0];

/**
 * the onClick function when Rover camera image is clicked to open image in a new tab
 * @param {string} imgName - used by other onClick callback
 * @param {string} imgUrl - url to the image
 */
const onClickCameraImg = (imgName, imgUrl) =>
  `window.open('${imgUrl}', '_blank');`;

/**
 * @description the onClick function when menu image is clicked to ser roverName in store
 * @param {string} imgName - name of rover
 * @param {string} imgUrl - used by other onClick callback
 */
const onClickUpdateRoverName = (imgName, imgUrl) =>
  `updateStore(store, { roverName: "${imgName}" }, true)`;

/**
 * @descriptioncombine arrays to object as `key (arr1): val (arr2)`
 * - credit: courtesy of https://www.tutorialspoint.com/how-to-combine-2-arrays-into-1-object-in-javascript 2022-11-12
 * @param {string[]} arr1 - the array of keys
 * @param {string[]} arr2 - the array of values
 * @return {object} - the combined object
 */
const combineArrays = (arr1, arr2) => {
  return arr1.reduce((acc, val, ind) => {
    acc[val] = arr2[ind];
    return acc;
  }, {});
};

/**
 * @description Higher Order Function (HOF) to filter object keys based on callback function.
 * - credit: courtesy of https://masteringjs.io/tutorials/fundamentals/filter-object 2022-11-12 (minor change)
 * @param {string} obj - the object
 * @param {function} callback - the callback function ***
 * @return {object} - the filtered object
 */
const filterObject = (obj, callback) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, val]) => callback(key, val))
  );
};

/**
 * @description Higher Order Function (HOF) to Filter to exclude a specified keyName
 * @param {string} key - the key
 * @param {string} value - the value
 * @return {function} - anonymous function with boolean test for key is NOT the specified keyName ***
 */
const filterExcludeKey = (key, val) => {
  return (keyName) => key !== keyName;
};
/**
 * filter to exclude key named `dateStamp`
 */
filterExcludeDateStamp = filterExcludeKey("dateStamp");
/**
 * filter to exclude key named `photos`
 */
filterExcludePhotos = filterExcludeKey("photos");

// ------------------------------------------------------  COMPONENTS

/**
 * @description Higher Order Function (HOF) to generate a html table from object
 * @param {string} cssClassName - ClassName of table
 */
const generateHtmlTable = (cssClassName) => {
  return (obj) =>
    Object.entries(obj).reduce((acc, entry) => {
      [key, value] = entry;
      return `${acc}\n<tr><td>${key}</td><td>${value}</td></tr>`;
    }, `<table class="${cssClassName}">`) + "\n</table>";
};

/**
 * @description generate a html table from object with css ClassName `roverTable`
 */
const generateRoverHtmlTable = generateHtmlTable("roverTable");

/**
 * @description dynamic component to return html instructions or rover manifest html table
 * @param {obj} state - the local copy of immutable store
 * @return - html instructions or rover manifest html table
 */
const App = (state) => {
  let titleElement = document.getElementById("title");
  titleElement.innerText='Mars Rover Dashboard'
  const { roverName } = state;
  if (roverName) {
    const manifest = state[manifestKey(roverName)];
    const manifest2 = filterObject(manifest, filterExcludeDateStamp);
    return `
		<p>Rover Details</p>
		${generateRoverHtmlTable(manifest2)}
	`;
  } else
    return `
		<br>
		<p>Greetings Earthling!</p>
		<p>Welcome to the Mars Rover dashboard. </p>
		<p>Please select a rover.</p>
	`;
};

/**
 * @description add the Rover menu images to the DOM
 * @param {obj} state - the local copy of immutable store
 */
const addMenuTilesToDOM = (state) => {
  let menuElement = document.getElementById("menuGrid");
  const className = "menuTile";
  const ImgEntries = combineArrays(state.roverNames, state.roverImages);
  Object.entries(ImgEntries).forEach((imgEntry) => {
    let newTile = generateTile(imgEntry, className, onClickUpdateRoverName);
    menuElement.appendChild(newTile);
  });
};

/**
 * @description add the Rover photo images to the DOM
 * @param {obj} state - the local copy of immutable store
 */
const addImgTilesToDOM = (state) => {
  let imgElement = document.getElementById("imgGrid");
  imgElement.innerHTML = "";
  const className = "imgTile";
  const roverName = state.roverName;
  const photos = state[photosKey(roverName)];
  const ImgEntries = combineArrays(
    photos.map((v) => `${v.id}-${v.camera.full_name}-${v.earth_date}`),
    photos.map((v) => v.img_src)
  );
  Object.entries(ImgEntries).forEach((imgEntry) => {
    let newTile = generateTile(imgEntry, className, onClickCameraImg);
    imgElement.appendChild(newTile);
  });
};

/**
 * @description Higher Order Function (HOF) to add the Rover photo images to the DOM
 * @param {obj} imgEntry - 2 element array of imgName, imgUrl
 * @param {obj} className - the css class name
 * @param {obj} onClickCallback - the onClick callback function ***
 * @returns {obj} tile - a tile element
 */
const generateTile = (imgEntry, className, onClickCallback) => {
  [imgName, imgUrl] = imgEntry;
  const tile = document.createElement("div");
  const title = document.createElement("h4");
  title.innerText = imgName;
  const img = document.createElement("img");
  img.setAttribute("alt", imgName);
  img.setAttribute("src", imgUrl);
  img.setAttribute("class", className);
  img.setAttribute("onclick", onClickCallback(imgName, imgUrl));
  tile.appendChild(title);
  tile.appendChild(img);
  return tile;
};

/**
 * @description add weatherIframe to DOM
 * @param {obj} state - the local copy of immutable store
 */
const addWeatherIframeToDOM = (state) => {
  let weatherElement = document.getElementById("weatherIframe");
  weatherElement.innerHTML = state.MarsWeatherIframe;
};

// ------------------------------------------------------  API CALLS

/**
 * @description call local API to get the rover photos for specified sol
 * @param {obj} state - the local copy of immutable store
 * @param {string} roverName - the RoverName
 * @param {number} sol - the martial day number
 */
const getRoverPhotos = async (state, roverName, sol) => {
  const url = `http://localhost:3000/rover-photos/${roverName}?sol=${sol}`;
  console.log(`getRoverPhotos: ${url}`);
  await fetch(url)
    .then((res) => res.json())
    .then((json) => {
      json.dateStamp = dateStamp();
      const entry = {};
      entry[photosKey(roverName)] = json;
      updateStore(state, entry);
      return state;
    });
  return;
};

/**
 * @description call local API to get the rover manifest & then with `max_sol` call getRoverPhotos
 * @param {obj} state - the local copy of immutable store
 * @param {string} roverName - the RoverName
 */
const getRoverManifest = async (state, roverName) => {
  const url = `http://localhost:3000/rover-manifest/${roverName}`;
  console.log(`getRoverManifest: ${url}`);
  await fetch(url)
    .then((res) => res.json())
    .then((json) => {
      json.dateStamp = dateStamp();
      "photos" in json ? delete json.photos : false;
      const entry = {};
      entry[manifestKey(roverName)] = filterObject(json, filterExcludePhotos);
      updateStore(state, entry);
      if (
        (manifestKey(roverName) in state &&
          photosKey(roverName) in state === false) ||
        (photosKey(roverName) in state &&
          state[photosKey(roverName)].dateStamp !== dateStamp())
      ) {
        sol = state[manifestKey(roverName)].max_sol;
        getRoverPhotos(state, roverName, sol);
      }
      return;
    });
  return;
};

/**
 * @description loop through rovers and get manifest (& photos)
 * - experimented with forEach loop but await did not have the desired effect for me.
 * - Hope to learn to solve this in the next section of the course.
 * @param {obj} state - the local copy of immutable store
 */
const loadRoverData = async (state) => {
  const roverNames = state.roverNames;
  for (let indexCount = 0; indexCount < roverNames.length; indexCount++) {
    roverName = roverNames[indexCount];
    if (
      manifestKey(roverName) in state === false ||
      state[manifestKey(roverName)].dateStamp !== dateStamp()
    ) {
      await getRoverManifest(state, roverName);
    }
  }
  return;
};
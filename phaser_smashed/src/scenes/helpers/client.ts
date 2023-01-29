export const getClientInformation = (): void => {
  let location: any;
  let counterContainer = document.querySelector('#visits');
  // let resetButton = document.querySelector('#reset');
  let visitCountString: string | null = localStorage.getItem('page_view');
  let visitCountNumber: number = Number(visitCountString)
    ? Number(visitCountString)
    : 0;

  // Check if page_view entry is present
  if (visitCountString) {
    visitCountNumber =
      (Number(visitCountString) ? Number(visitCountString) : 0) + 1;
    localStorage.setItem('page_view', JSON.stringify(visitCountNumber));
  } else {
    localStorage.setItem('page_view', '1');
  }

  // if (counterContainer !== null) {
  //   counterContainer.innerHTML = visitCountString ? visitCountString : '1';
  // }

  // let ref = document.referrer;
  // let href = location.href;
  // let agent = navigator.userAgent;

  fetch('https://ipapi.co/json/')
    .then((response) => response.json())
    .then((responseJson) => {
      // let city = responseJson.city;
      // let country = responseJson.country;
      location =
        responseJson.city +
        ', ' +
        responseJson.region +
        ' (' +
        responseJson.country +
        ')';
      // if (
      //   document.querySelector('#city') !== null &&
      //   document.querySelector('#city') !== undefined &&
      //   document.querySelector('#city')?.innerHTML !== null
      // ) {
      //   document.querySelector('#city').innerHTML = location;
      // }
      // document.querySelector('#ip').innerHTML = responseJson.ip;
      // document.querySelector("#region").innerHTML=responseJson.region;
      // document.querySelector("#country").innerHTML=responseJson.country;

      console.log(responseJson);
    });
};

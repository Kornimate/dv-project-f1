const DEV_URL = "http://127.0.0.1:4000/api";

const YEARS = (() => {
    const current = (new Date()).getFullYear();
    const years = [];

    for(let i = current;i > 2018; i--){
        years.push(i)
    }

    return years;
})()

export {DEV_URL, YEARS}
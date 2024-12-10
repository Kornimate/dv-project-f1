const DEV_URL = "http://127.0.0.1:5000/api";

const DRIVERS2024 = [
    { code: 'VER', name: 'Max Verstappen' },
    { code: 'HAM', name: 'Lewis Hamilton' },
    { code: 'PER', name: 'Sergio Perez' },
    { code: 'RUS', name: 'George Russell' },
    { code: 'ALO', name: 'Fernando Alonso' },
    { code: 'LEC', name: 'Charles Leclerc' },
    { code: 'SAI', name: 'Carlos Sainz' },
    { code: 'RIC', name: 'Daniel Ricciardo' },
    { code: 'ZHO', name: 'Zhou Guanyu' },
    { code: 'TSU', name: 'Yuki Tsunoda' },
    { code: 'NOR', name: 'Lando Norris' },
];

const YEARS = (() => {
    const current = (new Date()).getFullYear();
    const years = [];

    for(let i = current;i > 2018; i--){
        years.push(i)
    }

    return years;
})()


export {DEV_URL, DRIVERS2024, YEARS}
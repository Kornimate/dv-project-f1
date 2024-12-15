const DEV_URL = "http://127.0.0.1:5000/api";

const DRIVERS2024 = [
    { code: 'VER', name: 'Max Verstappen' },
    { code: 'PER', name: 'Sergio Perez' },
    { code: 'LEC', name: 'Charles Leclerc' },
    { code: 'SAI', name: 'Carlos Sainz' },
    { code: 'HAM', name: 'Lewis Hamilton' },
    { code: 'RUS', name: 'George Russell' },
    { code: 'ALO', name: 'Fernando Alonso' },
    { code: 'STR', name: 'Lance Stroll' },
    { code: 'NOR', name: 'Lando Norris' },
    { code: 'PIA', name: 'Oscar Piastri' },
    { code: 'GAS', name: 'Pierre Gasly' },
    { code: 'OCO', name: 'Esteban Ocon' },
    { code: 'BOT', name: 'Valtteri Bottas' },
    { code: 'ZHO', name: 'Zhou Guanyu' },
    { code: 'ALB', name: 'Alexander Albon' },
    { code: 'SAR', name: 'Logan Sargeant' },
    { code: 'TSU', name: 'Yuki Tsunoda' },
    { code: 'RIC', name: 'Daniel Ricciardo' },
    { code: 'MAG', name: 'Kevin Magnussen' },
    { code: 'HUL', name: 'Nico Hülkenberg' },
    { code: 'VET', name: 'Sebastian Vettel' },
    { code: 'RAI', name: 'Kimi Räikkönen' },
    { code: 'GRO', name: 'Romain Grosjean' },
    { code: 'KVY', name: 'Daniil Kvyat' },
    { code: 'GIO', name: 'Antonio Giovinazzi' },
    { code: 'MSC', name: 'Mick Schumacher' },
    { code: 'LAT', name: 'Nicholas Latifi' },
    { code: 'KUB', name: 'Robert Kubica' },
    { code: 'DEV', name: 'Nyck de Vries' },
    { code: 'PAL', name: 'Jolyon Palmer' },
    { code: 'FIT', name: 'Pietro Fittipaldi' },
    { code: 'HRT', name: 'Jack Aitken' }
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
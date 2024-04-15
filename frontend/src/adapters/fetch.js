export const httpGet = (endpoint) => {
    console.log('HTTP GET', endpoint)
    return fetch(endpoint)
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.log(err);
        });
}
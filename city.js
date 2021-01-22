var currentCountry = JSON.parse(sessionStorage.country);
var workingObj = {
    name: '',
    area: '',
    population: '',
    postcode: '',
    country_id: ''
};
var searchText = sessionStorage.getItem('search-city');
var findings = sessionStorage.getItem('find-city');
var cities = new Array();
const http = 'https://akademija.teltonika.lt/api4/index.php/cities';

function loadData() {
    cities = [];
    let countryName = document.getElementById('city-name');
    countryName.innerText = currentCountry.name;
    fetch(http + '/' + currentCountry.id).then(res => {
        if (res.ok) {
            res.json().then(json => {
                for (const city of json) {
                    cities.push(city);
                }
                if (!searchText) {
                    populateTable(cities);
                } else {
                    if (findings) {
                        populateTable(JSON.parse(findings));
                    } else populateTable(new Array());
                }
            })
        } else {
            alert("Http-error: " + res.status);
        }
    })
}

function confirmation(msg) {
    var rez = confirm(msg);
    if (rez == true) {
        return true;
    } else {
        return false;
    }
}

function remove(itemId) {
    if (confirmation('Are you sure want to delete this city?')) {
        let city = document.getElementById(itemId);
        city.remove();
        fetch(http + '/' + itemId, {
            method: 'DELETE',
        })
            .then(res => res.text())
            .then(res => alert(res))
    }
}

function openAddModal() {
    document.getElementById('modal-info').innerText = 'PRIDĖTI MIESTĄ';
    var modal = document.getElementById('formModal');
    var addBtn = document.getElementById('confirm-add');
    addBtn.style.display = "block";
    modal.style.display = "block";
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
        modal.style.display = "none";
        addBtn.style.display = "none";
    }
}

function openUpdateModal(itemId) {
    fetch(http + '/' + currentCountry.id).then(res => {
        if (res.ok) {
            res.json().then(json => {
                for (const city of json) {
                    if (city.id == itemId) {
                        workingObj.id = itemId;
                        document.getElementById('name').value = workingObj.name = city.name;
                        document.getElementById('area').value = workingObj.area = city.area;
                        document.getElementById('pop').value = workingObj.population = city.population;
                        document.getElementById('post_code').value = workingObj.postcode = city.postcode;
                        break;
                    }
                }
            })
        } else {
            alert("Http-error: " + res.status);
            return;
        }
    })

    var modal = document.getElementById('formModal');
    document.getElementById('modal-info').innerText = 'REDAGUOTI ŠALĮ';
    var updateBtn = document.getElementById('confirm-update');
    updateBtn.style.display = "block";
    modal.style.display = "block";
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function () {
        modal.style.display = "none";
        updateBtn.style.display = "none";
        resetForm();
    }
}

function updateCity() {
    var cityId = workingObj.id;
    delete workingObj.id;
    workingObj.name = document.getElementById('name').value;
    workingObj.area = document.getElementById('area').value;
    workingObj.population = document.getElementById('pop').value;
    workingObj.postcode = document.getElementById('post_code').value;
    workingObj.country_id = currentCountry.id;
    if (workingObj.name && workingObj.area && workingObj.population && workingObj.postcode) {
        fetch(http + '/' + cityId, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=ISO-8859-1'
            },
            body: JSON.stringify(workingObj)
        }).then(res => res.json())
            .then(() => {
                loadData();
                let modal = document.getElementById('formModal');
                let updateBtn = document.getElementById('confirm-update');
                modal.style.display = "none";
                updateBtn.style.display = "none";
                alert('City updated');
            })
            .catch(err => alert(err))
    }
}

function addCity() {
    let addBtn = document.getElementById('confirm-add');
    addBtn.style.display = "block";
    var modal = document.getElementById('formModal');
    modal.style.display = "block";
    workingObj.name = document.getElementById('name').value;
    workingObj.area = document.getElementById('area').value;
    workingObj.population = document.getElementById('pop').value;
    workingObj.postcode = document.getElementById('post_code').value;
    workingObj.country_id = currentCountry.id;
    if (workingObj.name && workingObj.area && workingObj.population && workingObj.postcode) {
        fetch(http, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workingObj)
        })
            .then(res => res.json()).then(() => {
                sessionStorage.removeItem('search-city');
                sessionStorage.removeItem('find-city');
                loadData();
                let modal = document.getElementById('formModal');
                let addBtn = document.getElementById('confirm-add');
                modal.style.display = "none";
                addBtn.style.display = "none";
                alert('City added');
            })
            .catch(err => alert(err))
    } else {
        alert('every field is required')
    }
}

function searchByInput() {
    searchText = document.getElementById('search').value;
    let findings = new Array();
    if (!searchText) {
        sessionStorage.removeItem('search-city');
        sessionStorage.removeItem('find-city');
    } else {
        sessionStorage.setItem('search-city', searchText);
        cities.forEach(city => {
            if (city.name == searchText) {
                findings.push(city);
            }
        });
        sessionStorage.setItem('find-city', JSON.stringify(findings));
    }
}

function sort() {
    if (cities.slice(1).every((item, i) => cities[i].name <= item.name)) {
        cities.sort((a, b) => (a.name > b.name) ? -1 : 1);
    }
    else {
        cities.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }
    populateTable(cities);
}

function filterDate() {
    searchText = document.getElementById('date').value;
    let findings = new Array();
    if (!searchText) {
        sessionStorage.removeItem('search-city');
        sessionStorage.removeItem('find-city');
    } else {
        sessionStorage.setItem('search-city', searchText);
        cities.forEach(city => {
            if (city.created_at.includes(searchText)) {
                findings.push(city);
            }
        });
        sessionStorage.setItem('find-city', JSON.stringify(findings));
    }
}

function resetForm() {
    document.getElementById('name').value = '';
    document.getElementById('area').value = '';
    document.getElementById('pop').value = '';
    document.getElementById('post_code').value = '';
}

function populateTable(data) {
    let tbodyData = document.querySelector('#city-table tbody');
    tbodyData.innerHTML = '';
    data.forEach(city => {
        let row = document.createElement('tr');
        let id = city.id;
        row.setAttribute('id', id);
        let col1 = document.createElement('td');
        col1.innerText = city.name;

        let col2 = document.createElement('td');
        col2.innerText = city.area;
        let col3 = document.createElement('td');
        col3.innerText = city.population;
        let col4 = document.createElement('td');
        col4.innerText = city.postcode;
        let col5 = document.createElement('td');

        let button1 = document.createElement('button');
        let icon1 = document.createElement('i');
        icon1.innerHTML = '<i class="gg-trash"></i>';
        button1.setAttribute('onClick', 'remove("' + id + '")')
        button1.appendChild(icon1);
        button1.setAttribute('id', 'updateBtn');

        let button2 = document.createElement('button');
        let icon2 = document.createElement('i');
        icon2.innerHTML = '<i class="gg-pen"></i>';
        button2.setAttribute('onClick', 'openUpdateModal("' + id + '")')
        button2.appendChild(icon2);
        button2.setAttribute('id', 'removeBtn');

        col5.appendChild(button1);
        col5.appendChild(button2);

        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);
        row.appendChild(col5);

        tbodyData.appendChild(row);
    });
    if (data.length > 0) {
        let form = document.getElementById('form');
        let pagination = document.createElement('div');
        pagination.setAttribute('id', 'pageNavPosition');
        pagination.setAttribute('class', 'pager-nav');
        form.appendChild(pagination);
        pager = new Pager('city-table', 10);
        pager.init();
        pager.showPageNav('pager', 'pageNavPosition');
        pager.showPage(1);
    }
}


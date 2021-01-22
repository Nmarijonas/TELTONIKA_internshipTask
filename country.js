var workingObj = { name: '', area: '', population: '', calling_code: '' };
var searchText = sessionStorage.getItem('search-country');
var findings = sessionStorage.getItem('find-country');
var countries = new Array();
const http = 'https://akademija.teltonika.lt/api4/index.php/countries';

function loadData() {
    countries = [];
    fetch(http).then(res => {
        if (res.ok) {
            res.json().then(json => {
                for (const country of json.countires) {
                    countries.push(country);
                }
                if (!searchText) {
                    populateTable(countries);
                } else {
                    if (findings.length > 2) {
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
    if (confirmation('Are you sure want to delete this country')) {
        let country = document.getElementById(itemId);
        country.remove();
        fetch(http + '/' + itemId, {
            method: 'DELETE',
        })
            .then(res => res.text())
            .then(res => alert(res))
    }
}

function openAddModal() {
    document.getElementById('modal-info').innerText = 'PRIDĖTI ŠALĮ';
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
    fetch(http + '/' + itemId).then(res => {
        if (res.ok) {
            res.json().then(json => {
                workingObj.id = json.id;
                document.getElementById('name').value = workingObj.name = json.name;
                document.getElementById('area').value = workingObj.area = json.area;
                document.getElementById('pop').value = workingObj.population = json.population;
                document.getElementById('call_code').value = workingObj.calling_code = json.calling_code;
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

function setCountryInfo(id) {
    let workingObj = { id: '', name: '', area: '', population: '', calling_code: '' }
    fetch(http + '/' + id).then(res => {
        if (res.ok) {
            res.json().then(json => {
                workingObj.id = json.id;
                workingObj.name = json.name;
                workingObj.area = json.area;
                workingObj.population = json.population;
                workingObj.calling_code = json.calling_code;
                sessionStorage.setItem('country', JSON.stringify(workingObj));
                window.open('./city.html', '_self');
            })
        } else {
            alert("Http-error: " + res.status);
            return;
        }
    })
}

function updateCountry() {
    workingObj.name = document.getElementById('name').value;
    workingObj.area = document.getElementById('area').value;
    workingObj.population = document.getElementById('pop').value;
    workingObj.calling_code = document.getElementById('call_code').value;
    if (workingObj.name && workingObj.area && workingObj.population && workingObj.calling_code) {
        fetch((http + '/' + workingObj.id), {
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
                alert('Country updated');
            })
            .catch(err => alert(err))
    }
}

function addCountry() {
    let addBtn = document.getElementById('confirm-add');
    addBtn.style.display = "block";
    var modal = document.getElementById('formModal');
    modal.style.display = "block";
    workingObj.name = document.getElementById('name').value;
    workingObj.area = document.getElementById('area').value;
    workingObj.population = document.getElementById('pop').value;
    workingObj.calling_code = document.getElementById('call_code').value;
    if (workingObj.name && workingObj.area && workingObj.population && workingObj.calling_code) {
        fetch(http, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workingObj)
        })
            .then(res => res.json()).then(data => {
                loadData();
                let modal = document.getElementById('formModal');
                let addBtn = document.getElementById('confirm-add');
                modal.style.display = "none";
                addBtn.style.display = "none";
                alert('Country added');
            })
            .catch(err => alert(err))
    }
}

function resetForm() {
    document.getElementById('name').value = '';
    document.getElementById('area').value = '';
    document.getElementById('pop').value = '';
    document.getElementById('call_code').value = '';
}

function searchByInput() {
    searchText = document.getElementById('search').value;
    let findings = new Array();
    if (!searchText) {
        sessionStorage.removeItem('search-country');
        sessionStorage.removeItem('find-country');
    } else {
        sessionStorage.setItem('search-country', searchText);
        countries.forEach(country => {
            if (country.name == searchText) {
                findings.push(country);
            }
        });
        sessionStorage.setItem('find-country', JSON.stringify(findings));
    }
}

function filterDate() {
    searchText = document.getElementById('date').value;
    let findings = new Array();
    if (!searchText) {
        sessionStorage.removeItem('search-country');
        sessionStorage.removeItem('find-country');
    } else {
        sessionStorage.setItem('search-country', searchText);
        countries.forEach(country => {
            if (country.created_at.includes(searchText)) {
                findings.push(country);
            }
        });
        sessionStorage.setItem('find-country', JSON.stringify(findings));
    }
}

function sort() {
    if (countries.slice(1).every((item, i) => countries[i].name <= item.name)) {
        countries.sort((a, b) => (a.name > b.name) ? -1 : 1);
    }
    else {
        countries.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }
    populateTable(countries);
}

function populateTable(data) {
    let tbodyData = document.querySelector('#country-table tbody');
    tbodyData.innerHTML = '';
    data.forEach(function (country) {
        let row = document.createElement('tr');
        let id = country.id;
        row.setAttribute('id', id);
        let col1 = document.createElement('td');
        var a = document.createElement('a');
        a.setAttribute('onClick', 'setCountryInfo("' + id + '")');
        var linkText = document.createTextNode(country.name);
        a.appendChild(linkText);
        a.title = country.name;
        col1.appendChild(a);
        let col2 = document.createElement('td');
        col2.innerText = country.area;
        let col3 = document.createElement('td');
        col3.innerText = country.population;
        let col4 = document.createElement('td');
        col4.innerText = country.calling_code;
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
        pager = new Pager('country-table', 5);
        pager.init();
        pager.showPageNav('pager', 'pageNavPosition');
        pager.showPage(1);
    }
}

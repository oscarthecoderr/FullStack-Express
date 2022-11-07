var order = document.getElementsByClassName("order");
var pay = document.getElementsByClassName("pay");
var trash = document.getElementsByClassName("delete");

Array.from(order).forEach(function(element,index) {
  element.addEventListener('click', function(){
    const food = this.parentNode.childNodes[1].innerText
    const cost = this.parentNode.childNodes[7].innerText
    console.log(food,cost)

    fetch('orders', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
         food,
         cost
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});

Array.from(pay).forEach(function(element,index) {
element.addEventListener('click', function(){
//const name = this.parentNode.parentNode.childNodes[1].innerText
const _id = this.parentNode.getAttribute('id')
console.log(_id)
fetch('pay', {
  method: 'put',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
     '_id': _id,
  })
})
.then(response => {
  if (response.ok) return response.json()
})
.then(data => {
  console.log(data)
  window.location.reload()
})
});
});

Array.from(trash).forEach(function(element) {
  element.addEventListener('click', function(){
    const _id = this.parentNode.getAttribute('id')
    fetch('delete', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '_id':_id
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});


import { useEffect, useState } from "react";
import { groupBy } from 'core-js/actual/array/group-by.js'; 
import '../App.scss'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


const Beers = () => {

    const [beerData, setBeerData] = useState([]);
    const [orderData, setOrderData] = useState([]);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [finalOrder, setfinalOrder] = useState([]);

    useEffect(() => {
        fetch("https://random-data-api.com/api/beer/random_beer?size=20")
        .then((res) => res.json())
        .then((data) => {
            setBeerData(data);
            if(typeof(localStorage.getItem("openOrder")) === 'object'){
                localStorage.setItem("openOrder", "[]")
                localStorage.setItem("finalOrders", "[]")
            }
            if(JSON.parse(localStorage.getItem("openOrder")).length > 0){
                setOrderData(JSON.parse(localStorage.getItem("openOrder")))
                setfinalOrder(JSON.parse(localStorage.getItem("finalOrders")))
                const getOpenOrder = JSON.parse(localStorage.getItem("openOrder"));
                const getStyleFromOrder = Object.values(getOpenOrder).map((order)=>{return order.style})
                let getUniqueStyle = getStyleFromOrder.filter((element, index) => {
                    return getStyleFromOrder.indexOf(element) === index;
                });
                setCurrentOrder(getUniqueStyle);
            } else{
                setfinalOrder(JSON.parse(localStorage.getItem("finalOrders")))
            }
        });        
    }, []);

    const groupBeerByStyle = beerData.groupBy(beer => {
        return beer.style;
    })
    const groupBeerByBrand = beerData.groupBy(beer => {
        return beer.brand;
    })
    const groupBeerByName = beerData.groupBy(beer => {
        return beer.name;
    })
    const groupFinalOrderByOrderCount = finalOrder.groupBy(order => {
        return order.order;
    })
    
    
    const beerGroupsStyle = Object.entries(groupBeerByStyle).map(([key, value]) => ({key,value}))
    const beerGroupsBrand = Object.entries(groupBeerByBrand).map(([key, value]) => ({key,value}))
    const beerGroupsName = Object.entries(groupBeerByName).map(([key, value]) => ({key,value}))
    const orderGroupsCount = Object.entries(groupFinalOrderByOrderCount).map(([key, value]) => ({key,value}))
    

    function addToOrder(e){
        const newList = orderData.concat(groupBeerByStyle[e.target.parentElement.firstChild.innerText])
        const list = Object.values(orderData).map((key)=>{return key.style})
        let styleOrder = currentOrder.concat(e.target.parentElement.firstChild.innerText)
        if(!list.includes(e.target.parentElement.firstChild.innerText)){
            setCurrentOrder(styleOrder);
            setOrderData(newList);
            setBeerData(beerData => beerData.filter((data) => data.style !== e.target.parentElement.firstChild.innerText))
        } else{
            console.log("Order already has that group")
        }
        localStorage.setItem("openOrder", JSON.stringify(newList))
    }
    function removeFromOrder(e){
        const groupRemoved = orderData.filter((data) => data.style === e.target.parentElement.firstChild.innerText)
        const newList = beerData.concat(groupRemoved);
        setBeerData(newList)
        setCurrentOrder(currentOrder => currentOrder.filter((data) => data !== e.target.parentElement.firstChild.innerText))
        setOrderData((orderData => orderData.filter((data) => data.style !== e.target.parentElement.firstChild.innerText)))
        const newOrder = orderData.filter((data)=> data.style !== e.target.parentElement.firstChild.innerText)
        localStorage.setItem("openOrder", JSON.stringify(newOrder))
        
    }

    function finalizeOrder(){
        const openOrder = JSON.parse(localStorage.getItem("openOrder"));
        if(JSON.parse(localStorage.getItem("finalOrders")).length > 0){
            const finalOrderAmount = Number(localStorage.getItem("finalOrderCount"));
            openOrder.map((order)=>{return order.order = finalOrderAmount+1})
            const getFinalOrders = JSON.parse(localStorage.getItem("finalOrders"))
            const addOpenToFinal = openOrder.concat(getFinalOrders)
            localStorage.setItem("finalOrders", JSON.stringify(addOpenToFinal))
            localStorage.setItem("openOrder", "[]")
            localStorage.setItem("finalOrderCount", (finalOrderAmount+1))
            setfinalOrder(addOpenToFinal)
            setCurrentOrder([])
            setOrderData([])
        } else {
            localStorage.setItem("finalOrderCount", "1")
            openOrder.map((order)=>{return order.order = 1})
            localStorage.setItem("finalOrders", JSON.stringify(openOrder))
            localStorage.setItem("openOrder", "[]")
            setfinalOrder(openOrder)
            setCurrentOrder([])
            setOrderData([])
        }
    }

    return(
        <div className="beers-cover">
            <h1>Order beer</h1>
            <div className="beer-groups" id="beer-groups">
                {beerGroupsStyle.map((beer, idx) => (
                    <div className="beer-group" key={idx}>
                        <span><strong>{beer.key}</strong></span>
                        <hr></hr>
                        <span><strong>Beers:</strong></span><br></br>
                        {
                            beer.value.map((item) => (
                                <div key={item.id} className="beer-item">
                                    <span>{item.brand}</span><br></br>
                                </div>
                            ))
                        }
                        <button onClick={addToOrder} className="addToOrder">Add to order</button>
                        <button>+</button>
                        <button>-</button>
                    </div>
                ))}
            </div>
            <hr></hr>
            <div className="beer-addition">
                <h2>Add beers to a group</h2>
                <label>Search group</label>
                <Autocomplete
                    autoComplete
                    id="beer-addition-group"
                    options={beerGroupsStyle.map((item)=>{return item.key})}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Beer group" />}
                />  
                <label>Search by name</label>
                <Autocomplete
                    autoComplete
                    id="beer-addition-name"
                    options={beerGroupsName.map((item)=>{return item.key})}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Beer name" />}
                />  
                <label>Search by brand</label>
                <Autocomplete
                    autoComplete
                    id="beer-addition-brand"
                    options={beerGroupsBrand.map((item)=>{return item.key})}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Beer brand" />}
                />  
            </div>
            <hr></hr>
            <div id="order-result">
                <h2>Open order</h2>
                {currentOrder.map((item, idx) =>(
                    <div key={idx} className="order">
                        <h4>{item}</h4>
                        <button onClick={removeFromOrder}>Remove</button>
                    </div>
                ))}
                <br></br>
                <button onClick={finalizeOrder}>Finalize order</button>
            </div>
            <hr></hr>
            <div id="final-order-result">
                <h2>Order history</h2>
                {orderGroupsCount.map((order, idx) =>(
                    <div key={idx} className="final-order">
                        <h4>Order-{order.key}</h4>

                        {
                            order.value.map((item) => (
                                <div key={item.id} className="order-item">
                                    <span><strong>{item.style}</strong></span><br></br>
                                    <span className="beer-brand">Brand: {item.brand}</span><br></br>
                                    <span className="beer-name">Name: {item.name}</span>
                                </div>
                            ))
                        }   
                        <hr></hr>
                    </div>
                ))}
            </div>
        </div>
    );

}

export default Beers;
import React from 'react';

import httpRequests from '../../../helpers/httpRequests';
import { Paper, Button, FormControl, FormLabel, FormControlLabel, RadioGroup, Radio, Card, CardContent, CardHeader, Grid, Snackbar, CircularProgress } from '@material-ui/core';

//import { withRouter } from 'react-router-dom';


class Shipment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: "zenodo",
            shipped: false,
            id: props.erc.id,
            shipments: [],
            message: "",
            backgroundColor: "",
            open: false,
        }

    }

    componentDidMount() {
        this.getShipmentList();
    }

    getShipmentList() {
        let self = this;
        httpRequests.getShipmentsByERCID(this.state.id)
            .then((response) => {
                for (let shipment of response.data) {
                    httpRequests.getShipment(shipment)
                        .then((response) => {
                            shipment = response.data
                            if(shipment.recipient == "download"){
                                shipment.deposition_url = config.baseUrl + "shipment/" + shipment.id + "/dl"; // eslint-disable-line
                            }
                            else{
                            let urls = this.createURL(shipment)
                            shipment.deposition_url = urls.url
                            shipment.doi = urls.doi
                            shipment.image_url = urls.image_url
                            }
                            let shipments = this.state.shipments;
                            shipments.unshift(response.data);
                            self.setState({ shipments });
                        })
                }
            })
    }

    createURL = (shipment) => {
        let url = null
        let image_url = null
        let doi = null
        let urls= {url, image_url, doi}
        if (shipment.recipient === "zenodo") {
            url = "https://www.zenodo.org/"
            
            if (shipment.status === "shipped") {
                url += "deposit/"
            }
            else if (shipment.status === "published") {
                url += "record/"
                doi = "https://doi.org/10.5281/zenodo."
                image_url= "https://zenodo.org/badge/DOI/10.5281/zenodo."
            }
            else {
                return ""
            }
        }
        else if (shipment.recipient === "zenodo_sandbox") {
            url = "https://sandbox.zenodo.org/"
            if (shipment.status === "shipped") {
                url += "deposit/"
            }
            else if (shipment.status === "published") {
                url += "record/"
                doi = "https://doi.org/10.5072/zenodo."
                image_url = "https://sandbox.zenodo.org/badge/DOI/10.5072/zenodo."
            }
            else {
                return urls
            }
        }
        else {
            return urls
        }

        url += shipment.deposition_id
        doi += shipment.deposition_id
        image_url += shipment.deposition_id +".svg"
        urls = {url, image_url, doi}
        return urls
    }

    ship = () => {
        let self = this;
        let message = "Shipping to " + self.state.value + " ..."
        self.setState({ showProgress: true, open: true, message: message, backgroundColor: "#004286" })
        httpRequests.createShipment(this.state.id, this.state.value)
            .then((response) => {
                let shipments = this.state.shipments;
                let shipment={}
                if(self.state.value == "download"){
                    const disposition = response.request.getResponseHeader('Content-Disposition')
                    console.log(disposition)
                    var fileName = "";
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    console.log(matches)
                    if (matches != null && matches[1]) {
                        fileName = matches[1].replace(/['"]/g, '');
                     }
                    let blob = new Blob([response.data], { type: 'application/zip' })
                    const downloadUrl = URL.createObjectURL(blob)
                    console.log(downloadUrl)
                    console.log(fileName)
                    let a = document.createElement("a"); 
                    a.href = downloadUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    let id = fileName.substring(0, fileName.lastIndexOf("."));
                    shipment.id = id
                    shipment.deposition_url = config.baseUrl + "shipment/" + shipment.id + "/dl"; // eslint-disable-line
                    shipment.recipient = self.state.value
                }
                else{
                shipment = response.data;
                console.log(shipment)
                console.log(response)
                let urls = this.createURL(shipment)
                shipment.deposition_url = urls.url
                shipment.doi = urls.doi
                shipment.image_url = urls.image_url
                }
                shipments.unshift(shipment);
                self.setState({ shipments });
                message = "sucessfull shipped to " + self.state.value
                self.setState({ showProgress: false, open: true, message: message, backgroundColor: "#008643" })
            })
            .catch(function (res2) {
                self.setState({ showProgress: false, open: true, message: "Shipment failed", backgroundColor: "#860000" })
                console.log(res2)
            })
    }

    handleChange = (e) => {
        this.setState({ value: e.target.value })
    }

    handleClose = () => {
        this.setState({ open: false })
    }

    updateShipment = (ship) => {
        console.log(ship)
        let shipments = this.state.shipments
        for (let i in shipments) {
            if (shipments[i].id === ship.id) {
                let shipment = shipments[i]
                shipment.status = ship.status
                let urls = this.createURL(shipment)
                shipment.deposition_url = urls.url
                shipment.doi = urls.doi
                shipment.image_url = urls.image_url
                shipments.splice(i, 1, shipment)
                console.log(shipment)
                this.setState(shipments)
                break;
            }
        }
    }

    publishShipment = (shipment) => {
        let self = this;
        let message = "Publishing on" + shipment.recipient + " ..."
        self.setState({ open: true, message: message, backgroundColor: "#004286" })

        httpRequests.publishShipment(shipment.id)
            .then((res) => {
                this.updateShipment(res.data)
                message = "Published on " + shipment.recipient
                self.setState({ open: true, message: message, backgroundColor: "#008643" })
            })
            .catch(function (res2) {
                self.setState({ open: true, message: "Publishment failed", backgroundColor: "#860000" })
                console.log(res2)
            })

    }

    hrefToLink(url) {
        window.open(url, '_blank');
    }



    render() {
        return (
            <div>
                <br />

                <Paper>
                    <p id="description"> Create new Shipment:</p>
                    <br></br>
                    <br />
                    <br />
                    <FormControl component="fieldset" >
                        <FormLabel component="legend">Coose destination</FormLabel>
                        <RadioGroup aria-label="gender" name="gender1" value={this.state.value} onChange={this.handleChange}>
                            <FormControlLabel id="zenodo" value="zenodo" control={<Radio />} label="Zenodo" />
                            <FormControlLabel id="zenodo_sandbox" value="zenodo_sandbox" control={<Radio />} label="Zenodo Sandbox" />
                            <FormControlLabel id="download" value="download" control={<Radio />} label="Download" />
                        </RadioGroup>
                    </FormControl>
                    <br />
                    <br />
                    <Button onClick={() => this.ship()} id="ship" variant="contained" disabled={this.state.showProgress}>
                        Ship
                </Button>
                    <br />
                    <br />
                    {this.state.showProgress
                        ? <CircularProgress />
                        : ''}
                    <br />
                </Paper>
                <br />
                <br />
                <br />
                <br />
                { <Paper>
                    <br />
                    Shipments:
                    <br />
                    {this.state.shipments.length === 0 ?
                        "No Shipments for this ERC" :
                        this.state.shipments.map((shipment, index) =>
                            <div key={index}>
                                <Card style={{ "text-align": "justify", "margin": "10px" }}>
                                    <CardHeader title={"Shipment  " + shipment.id} style={{ "padding-bottom": "0px" }} />
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item xs={9} style={{ "padding-top": "0px" }}>
                                                <p> <span style={{ "font-weight": "bold" }} id={"modified" + index}> Last modified on: </span> {shipment.last_modified}  <br />
                                                    <span style={{ "font-weight": "bold" }} id={"creator" + index}> Created by: </span> {shipment.user} <br />
                                                    <span style={{ "font-weight": "bold" }} id={"recipient" + index}> Recipient: </span> {shipment.recipient} <br />
                                                    <span style={{ "font-weight": "bold" }} id={"status" + index} > Status: </span> {shipment.status} <br />
                                                    {shipment.status === "published" ? 
                                                    <a href={shipment.deposition_url}><img src={shipment.image_url} alt="DOI"></img></a> : "" } </p>
                                            </Grid>
                                                <Grid item xs={3}>
                                                    {shipment.recipient == "download" ?
                                                    <div>
                                                    {shipment.deposition_url ? <Button variant="contained" size="small" color="primary" onClick={() => this.hrefToLink(shipment.deposition_url)}>
                                                    Download
                                                    </Button> : ""}
                                                    </div>
                                                    : 
                                                    <div>
                                                    {shipment.status === "shipped" ? <Button variant="contained" size="small" color="primary" onClick={() => this.publishShipment(shipment)}>
                                                        Publish
                                                         </Button> : ""}
                                                    <br />
                                                    <br />
                                                    {shipment.deposition_url ? <Button variant="contained" size="small" color="primary" onClick={() => this.hrefToLink(shipment.deposition_url)}>
                                                        {shipment.status === "shipped" ? "Inspect on" : "View on"} {shipment.recipient}
                                                    </Button> : "" }
                                                    </div>}

                                                </Grid>
                                            </Grid>
                                    </CardContent>
                                </Card>


                            </div>
                        )

                    }

                </Paper>}
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        open={this.state.open}
                        onClose={this.handleClose}
                        autoHideDuration={6000}
                        ContentProps={{
                            'aria-describedby': 'message-id',
                            'style': { backgroundColor: this.state.backgroundColor }
                        }}
                        message={<span id="message-id"> {this.state.message} </span>}
                    />
            </div>)
    }
}

export default Shipment;

import React, { Component } from 'react';
import {
  makeStyles, Stepper, Step, StepLabel, StepContent,
  Button, Typography, Paper, RadioGroup, FormControl
} from "@material-ui/core";

import httpRequests from '../../../helpers/httpRequests';
import CodeView from '../../erc/CodeView/CodeView';
import Manipulate from '../../erc/Manipulate/Manipulate';
import ComputationalResult from './ComputationalResult/ComputationalResult';
import SelectedCode from './SelectedCode/SelectedCode';
import SliderSetting from './SliderSetting/SliderSetting';
import WidgetSelector from './WidgetSelector/WidgetSelector';
import './bindings.css';

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  connectorActive: {
    '& $connectorLine': {
      borderColor: theme.palette.secondary.main,
    },
  },
  connectorCompleted: {
    '& $connectorLine': {
      borderColor: theme.palette.primary.main,
    },
  },
  connectorDisabled: {
    '& $connectorLine': {
      borderColor: theme.palette.grey[100],
    },
  },
  connectorLine: {
    transition: theme.transitions.create('border-color'),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%',
  },
  numField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '20%',
  },
}));

function VerticalLinearStepper(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Select result from the list below', 'Mark the plot()-Function in the code', 'Select the parameter by marking it in the code on the left', 
              'Configure a UI widget'];
  const [result, setResult] = React.useState();
  const [widget, setWidget] = React.useState('slider');
  const [disabled, disable] = React.useState(true);
  const params = props.binding.sourcecode.parameter;
  const plot = props.binding.sourcecode.plotFunction;
  let parameter = '';
  if ( params[0] !== undefined ) {
    parameter = props.binding.sourcecode.parameter[params.length-1].text;
    if ( disabled ) {
      disable(false);
    }
  } 
  if (plot !== '' && disabled) {
    disable(false);
  }

  const handlePlotChange = ( e ) => disable(false);
  const handleParameterChange = ( e ) => disable(false);
  const handleWidgetChange = ( e ) => setWidget(e.target.value);
  const handleSlider =  ( e, field ) => props.setSlider(field, e.target.value);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    props.setStep(activeStep + 1);
    disable(true);
    if (activeStep === 2) {
      props.setParameter(props.tmpParam)
    }
    if (activeStep === 3) {
      props.saveBinding()
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    props.setStep(activeStep - 1);
    disable(false);
  }

  const handleReset = () => {
    setActiveStep(0);
    props.setStep(0)
  }

  const handleResultChange = ( e ) => {
    if (e.target.value === '') {
      disable(true);
      setResult(e.target.value);
    } else {
      setResult(e.target.value);
      props.setResult(e.target.value);
      disable(false);
    }
  }

  const showPreview = () => {
    httpRequests.sendBinding(props.binding)
      .then(function (res) {
        console.log("created binding")
        httpRequests.runManipulationService(props.binding)
          .then(function (res2) {
            props.switchCodePreview();
          })
          .catch(function (res2) {
            console.log(res2)
          })
      })
      .catch(function (res) {
        console.log(res)
      })
  }

  const addParameter = () => {
    setActiveStep(2);
    props.setStep(2);
  }

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel><h3>{label}</h3></StepLabel>
            <StepContent>
              {activeStep === 0 ?
                <ComputationalResult value={result} handleResultChange={handleResultChange} />
              : ''}
              {activeStep === 1 ?
                <SelectedCode id="plotfunction" label="plot() function" handleChange={handlePlotChange} value={plot} />
              : ''}
              {activeStep === 2 ?
                <SelectedCode id="parameter" label="Parameter" handleChange={handleParameterChange} value={props.tmpParam} />
              : ''}
              {activeStep === 3 ?
                <div>
                  <FormControl component="fieldset">
                    <RadioGroup aria-label="position" name="position" value={widget} onChange={handleWidgetChange} row>
                      <WidgetSelector value="slider" label="Slider"/>
                      <WidgetSelector value="radio" label="Radio"/>
                    </RadioGroup>
                  </FormControl>
                  {widget === 'slider' ?
                    <div>
                      <SliderSetting id="min" label="Minimum value" type="number" handleSlider={(e) => handleSlider(e, 'minValue')} styles={classes.numField} />
                      <SliderSetting id="max" label="Maximum value" type="number" handleSlider={(e) => handleSlider(e, 'maxValue')} styles={classes.numField} />
                      <SliderSetting id="step" label="Step size" type="number" handleSlider={(e) => handleSlider(e, 'stepSize')} styles={classes.numField} />
                      <SliderSetting id="caption" label="Caption" type="text" handleSlider={(e) => handleSlider(e, 'caption')} styles={classes.textField} />
                      <Button variant="contained" color="primary"
                        onClick={showPreview}
                      >
                        Preview
                      </Button>
                      <Button variant="contained" color="primary" style={{marginLeft:'5%'}}
                        onClick={addParameter}
                      >
                        Add paramater
                      </Button>
                    </div>
                    : <div>
                        radio
                      </div>
                  }
                </div>
              : ''}
              <div className={classes.actionsContainer} style={{ marginTop: '5%' }}>
                <Button className={classes.button}
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  >
                  Back
                </Button>
                <Button variant="contained" color="primary" className={classes.button}
                  onClick={handleNext}
                  disabled={disabled}
                  >
                  {activeStep === steps.length - 1 ? 'Save' : 'Next'}
                </Button>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished</Typography>
          <Button onClick={handleReset} className={classes.button}>
            Reset
          </Button>
        </Paper>
      )}
    </div>
  );
}

class Bindings extends Component {
  constructor ( props ) {
      super ( props );
      this.state = {
        metadata:props.metadata,
        creationStep:0,
        bindings: [],
        binding:{
          id: props.compendium_id,
          computationalResult: {
            type: null,
            result: null,
          },
          port:5001,
          sourcecode: {
            file: props.metadata.mainfile,
            plotFunction: '',
            codelines: [{"start":30,"end":430}],
            parameter: [],
            uiWidget: [],
            }
        },
      codeview:true,
      tmpParam: '',
    }
  }

  handleMouseUp ( e ) {
    if (this.state.creationStep === 1) {
      try {
        this.setCode(window.getSelection().getRangeAt(0).toString()); 
      } catch (error) {     
      }
    } else if (this.state.creationStep === 2) {
      this.setState({
        tmpParam: window.getSelection().getRangeAt(0).toString(),
      });
    }
  }

  setResult ( result ) {
    if (result.indexOf("Figure") >= 0) {
      let state = this.state;
      state.binding.computationalResult = {
        type: 'figure',
        result: result,
      }
      this.setState(state);
    }
  }

  setStep ( step ) {
    this.setState({
      creationStep: step
    });
  }

  setParameter ( param ) {
    let state = this.state;
    let parameter = {
      text: param,
      name: param.split('<-')[0].trim(),
      val: Number(param.split('<-')[1].trim()),      
    }
    state.binding.sourcecode.parameter.push(parameter);
    this.setState(state);
  }

  setCode ( code ) {
    let state = this.state;
    state.binding.sourcecode.plotFunction = code;
    this.setState(state, () => {
      /*httpRequests.getCodelines(state.binding)
      .then( function ( res ) {
        console.log(res);
      })
      .catch( function (res) {
        console.log(res)
      })*/
    });
  }

  setSlider ( key, val ) {
    let state = this.state;
    let newVal = val;
    let params = state.binding.sourcecode.parameter;
    if (!isNaN(newVal)) {
      newVal = Number(newVal)
    }
    if (params.length>0) {
      if ( params[params.length-1].uiWidget === undefined ){
        params[params.length-1].uiWidget = {};
      }
      params[params.length-1].uiWidget[key] = newVal;
    } else {
      if ( params[0].uiWidget === undefined ){
        params[0].uiWidget = {};
      }
      params[0].uiWidget[key] = newVal;
    }
    
    this.setState(state);
  }

  saveBinding () {
    let state = this.state;
    state.metadata.interaction.push(this.state.binding);
    this.setState(state, this.props.updateMetadata(this.state.metadata));
  }

  switchCodePreview () {
    this.setState({
      codeview:!this.state.codeview,
    });
  }

  render() {
    console.log(this.state)
    return (
      <div className="bindingsView">
        {this.state.codeview ?
          <div>
            <h4>Create an interactive figure</h4>
            <div className='codeView'
              onMouseUp={this.handleMouseUp.bind(this)}
            >
              <CodeView code={this.props.codefile.data} class/>
            </div>
          </div>
          : 
          <div>
            <h4>Preview of the interactive figure</h4>
            <div className='codeView'>
              <Manipulate binding={this.state.binding}></Manipulate>
              <Button variant="contained" color="primary"
                onClick={this.switchCodePreview.bind(this)}
                >
                Back to code
              </Button>
            </div>
          </div>
        }
        <div className="steps">
          <VerticalLinearStepper
            setResult={this.setResult.bind(this)}
            binding={this.state.binding}
            setStep={this.setStep.bind(this)}
            setSlider={this.setSlider.bind(this)}
            saveBinding={this.saveBinding.bind(this)}
            switchCodePreview={this.switchCodePreview.bind(this)}
            setParameter={this.setParameter.bind(this)}
            tmpParam={this.state.tmpParam}
          />
        </div>
      </div>
    );
  }
}

export default Bindings;


/*
    getBindingJson(erc) {
        return {
            "id": erc.id,
            "computationalResult": {
                "type": "figure",
                "result": "Figure 3"
            },
            "port": 5001,
            "sourcecode": {
                "file": erc.metadata.o2r.mainfile,
                "codelines": [{"start":30,"end":424}],
                "parameter":
                    [{
                       "text":"velocity <- 0.5",
                       "name":"velocity",
                       "val":0.5,
                       "codeline":344,
                       "uiWidget":{
                          "type":"slider",
                          "minValue":0.1,
                          "maxValue":3.5,
                          "stepSize":0.1,
                          "caption":"Changing the velocity parameter affects damage costs"
                       }
                    },
                    {
                        "text":"duration <- 24",
                        "name":"duration",
                        "val":24,
                        "codeline":346,
                        "uiWidget":{
                           "type":"slider",
                           "minValue":1,
                           "maxValue":24,
                           "stepSize":1,
                           "caption":"Changing the duration parameter affects damage costs"
                        }
                     },
                     {
                        "text":"sediment <- 0.05",
                        "name":"sediment",
                        "val":0.05,
                        "codeline":345,
                        "uiWidget":{
                           "type":"slider",
                           "minValue":0.01,
                           "maxValue":1.0,
                           "stepSize":0.1,
                           "caption":"Changing the sediment parameter affects damage costs"
                        }
                     }
                    ],
                 "data":[
                    {
                       "file":"costs.csv",
                       "column":[
                          {
                             "name":"Costs",
                             "rows":"1-37"
                          }
                       ]
                    }
                 ]
            }
        }
    }
*/
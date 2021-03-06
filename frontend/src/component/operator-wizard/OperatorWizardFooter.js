import React from "react";
import PropTypes from "prop-types";
import {
  WizardFooter,
  WizardContextConsumer,
  Button
} from "@patternfly/react-core";

export default class OperatorWizardFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <WizardFooter>
        <WizardContextConsumer>
          {({ activeStep, onNext, onBack }) => {
            return (
              <React.Fragment>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={onNext}
                  className={
                    activeStep.id === this.props.maxSteps ? "pf-m-disabled" : ""
                  }
                >
                  Next
                </Button>
                <Button
                  variant="secondary"
                  type="submit"
                  onClick={onBack}
                  className={activeStep.id === 1 ? "pf-m-disabled" : ""}
                >
                  Back
                </Button>
                <Button
                  variant="link"
                  isInline
                  onClick={this.props.onEditYaml}
                  className={this.props.isFormValid ? "" : "pf-m-disabled"}
                >
                  View YAML
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={this.props.onDeploy}
                  className={this.props.isFormValid ? "" : "pf-m-disabled"}
                >
                  Deploy
                </Button>
              </React.Fragment>
            );
          }}
        </WizardContextConsumer>
      </WizardFooter>
    );
  }
}

OperatorWizardFooter.propTypes = {
  maxSteps: PropTypes.number.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  onDeploy: PropTypes.func.isRequired,
  onEditYaml: PropTypes.func.isRequired
};

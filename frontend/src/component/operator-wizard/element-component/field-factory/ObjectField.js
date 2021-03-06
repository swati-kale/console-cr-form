import React from "react";
import { ActionGroup, Button } from "@patternfly/react-core";
import FieldFactory from "./FieldFactory";

/**
 * These are the complex objects that need to create new childs.
 */
export class ObjectField {
  childDef = [];
  /**
   * How many times we've added an element chunk
   */
  elementAddCount = 0;
  /**
   * (Const) How many elements we're adding each time
   */
  elementChunkCount = 0;
  /**
   * Min fixed elements added to the component
   */
  minElements = [];
  /**
   * Max chunk of elements that could be added to this object.
   */
  maxElementsSize = 0;
  /**
   * Min chunk of elements that could be added to this object.
   */

  minElementsSize = 0;
  constructor(props) {
    this.props = props;
    this.addElements = this.addElements.bind(this);
    this.deleteElements = this.deleteElements.bind(this);
    if (Array.isArray(this.props.fieldDef.fields)) {
      this.minElementsSize =
        this.props.fieldDef.min === undefined
          ? 0
          : parseInt(this.props.fieldDef.min);
      this.maxElementsSize =
        this.props.fieldDef.max === undefined
          ? 0
          : parseInt(this.props.fieldDef.max);
      // let's copy the reference to keep a clear reference in memory.
      this.childDef = JSON.parse(JSON.stringify(this.props.fieldDef.fields));
      this.elementChunkCount = this.props.fieldDef.fields.length;
      this.elementAddCount =
        this.props.fieldDef.elementAddCount === undefined
          ? 0
          : parseInt(this.props.fieldDef.elementAddCount);
      this.minElements = this.addMinChildren();
      this.parentFieldNumber =
        this.props.parentid === undefined ? -1 : this.props.parentid;
      this.grandParentFieldNumber =
        this.props.grandParentId === undefined ? -1 : this.props.grandParentId;
    }
  }

  getJsx() {
    var jsxArray = [];
    var fieldJsx;

    fieldJsx = (
      <ActionGroup
        fieldid={this.props.ids.fieldGroupId}
        key={this.props.ids.fieldGroupKey}
      >
        <Button
          variant="secondary"
          id={this.props.ids.fieldId}
          key={this.props.ids.fieldKey}
          fieldnumber={this.props.fieldNumber}
          parentfieldnumber={this.parentFieldNumber}
          grandparentfieldnumber={this.grandParentFieldNumber}
          onClick={this.addObject}
        >
          Add new {this.props.fieldDef.label}
        </Button>
        <Button
          variant="secondary"
          id={this.props.ids.fieldId + 1}
          key={this.props.ids.fieldKey + 1}
          fieldnumber={this.props.fieldNumber}
          onClick={this.deleteObject}
          parentfieldnumber={this.parentFieldNumber}
          grandparentfieldnumber={this.grandParentFieldNumber}
          disabled={this.elementAddCount == 0}
        >
          Delete last {this.props.fieldDef.label}
        </Button>
      </ActionGroup>
    );
    jsxArray.push(fieldJsx);

    let combinedFieldNumber =
      this.parentFieldNumber + "_" + this.props.fieldNumber;
    if (this.grandParentFieldNumber != -1) {
      combinedFieldNumber =
        this.grandParentFieldNumber + "_" + combinedFieldNumber;
    }

    var sampleObj = this.retrieveObjectMap(combinedFieldNumber);
    //getting how many field in obj e.g env has 2 name and value +1 for devider
    if (sampleObj == "") {
      //it's the first time here, no such sample in the objectMap yet, so store it.
      this.storeObjectMap(this.props.fieldDef, combinedFieldNumber);

      if (this.parentFieldNumber != -1) {
        //this is a 2nd tier object, double check if its parent is in the map or not.
        const parentCombinedFieldNumber =
          this.grandParentFieldNumber + "_" + this.parentFieldNumber;
        const parentSampleObj = this.retrieveObjectMap(
          parentCombinedFieldNumber
        );
        if (parentSampleObj == "") {
          //its parent is not store in object map yet, store the sample now.
          let fields = this.props.page.props.pageDef.fields;
          if (this.grandParentFieldNumber != -1) {
            fields = fields[this.grandParentFieldNumber].fields;
          }
          const parentField = fields[this.parentFieldNumber];
          this.storeObjectMap(parentField, parentCombinedFieldNumber);

          if (parentField.min == 0) {
            parentField.fields = [];
          }
        }
      }

      if (this.props.fieldDef.min == 0) {
        //if it's the 1st time here, and field.min ==0
        //so after store it to the map, remove from render json form, then it won't be displayed
        this.props.fieldDef.fields = [];
      } else if (this.props.fieldDef.min > 1) {
        //for field.min == 1 do nothing, just leave the sample there as the 1st object in array which will be displayed
        //for field.min > 1, need to insert more objects as the min value requires
        //TODO:

        console.log("!!!!!!!! TODO: add more objects");
      }
    }

    if (this.minElementsSize > 0) {
      var groupCount = this.minElements.length / this.minElementsSize;
      for (var index = 0; index < this.minElementsSize; index++) {
        var startIndex = index * groupCount;
        var endIndex = startIndex + groupCount;
        var fieldBlock = this.minElements.slice(startIndex, endIndex);
        var section = this.props.fieldDef.label + "section_" + index;
        jsxArray.push(
          <div
            id={section}
            key={section}
            style={{
              display: "block"
            }}
          >
            <br />
            <div style={{ fontWeight: "bold" }}>
              {this.props.fieldDef.label}
            </div>
            <div className="pf-c-card">
              <div className="pf-c-card__body pf-c-form">{fieldBlock}</div>
            </div>
          </div>
        );
      }
    }
    console.log("Here is the whole jsxArray:", jsxArray);
    return jsxArray;
  }

  retrieveObjectMap(fieldNumber) {
    const key = this.props.pageNumber + "_" + fieldNumber;
    var value = null;
    if (this.props.page.props !== undefined) {
      value = this.props.page.props.getObjectMap(key);
    }

    if (value == null) {
      return "";
    } else {
      return JSON.parse(value);
    }
  }

  storeObjectMap(field, fieldNumber) {
    //first time deal with this key value pair, store fields (the whole array, can't be just field[0]) to the map
    const key = parseInt(this.props.pageNumber) + "_" + fieldNumber;
    console.log(
      "pageNumber" +
        "::::" +
        parseInt(this.props.pageNumber) +
        "fieldNumber" +
        "::::" +
        fieldNumber
    );
    console.log("label" + "::::" + field.label + "key" + "::::" + key);
    // const key=fieldGroupKey;
    if (
      this.props.page.props !== undefined &&
      this.props.page.props.objectMap !== undefined
    ) {
      this.props.page.props.storeObjectMap(key, JSON.stringify(field.fields));
    }
  }

  removeObjectMapPrefix(parent, fieldNumber) {
    if (
      this.props.page.props !== undefined &&
      this.props.page.props.objectMap !== undefined
    ) {
      const key =
        parseInt(this.props.pageNumber) + "_" + parent + "_" + fieldNumber;
      this.props.page.props.removeObjectMapPrefix(key);
    }
  }

  createChildrenChunk() {
    var children = [];
    if (Array.isArray(this.childDef) && this.childDef.length > 0) {
      children.push(
        ...FieldFactory.newInstances(
          JSON.parse(JSON.stringify(this.childDef)),
          this.props.jsonSchema,
          this.props.pageNumber,
          this.props.page
        )
      );
    }
    return children;
  }
  addMinChildren() {
    var pos = 0,
      elements = [];

    if (this.props.fieldDef.fields) {
      this.props.fieldDef.fields.forEach((subfield, i) => {
        if (this.props.fieldDef.min == 0) {
          //means don't generate the 1st one unless user press button
          //console.log("field.min == 0, won't render ");
        } else {
          var parentjsonpath = this.props.fieldDef.jsonPath;
          var res = "";
          //change the JsomPath before insert
          if (parentjsonpath.length < subfield.jsonPath.length) {
            res = subfield.jsonPath.substring(
              parentjsonpath.length,
              subfield.jsonPath.length
            );
            res = parentjsonpath.concat(res);

            subfield.jsonPath = res.replace(/\*/g, pos);
          } else {
            subfield.jsonPath = subfield.jsonPath.replace(/\*/g, pos);
          }
          if (subfield.type != "object" && subfield.type != "fieldGroup") {
            let oneComponent = FieldFactory.newInstance(
              subfield,
              i,
              this.props.pageNumber,
              this.props.jsonSchema,
              this.props.page
            );
            elements.push(oneComponent.getJsx());
          } else {
            console.log(
              "parentId" +
                this.props.fieldNumber +
                " grandParentId" +
                this.props.parentid
            );
            let oneComponent = FieldFactory.newInstance(
              subfield,
              i,
              this.props.pageNumber,
              this.props.jsonSchema,
              this.props.page,
              this.props.fieldNumber,
              this.props.parentid
            );
            elements.push(oneComponent.getJsx());
          }
          //assigning each fiels for object with same pos and increment the pos when all fields are done
        }
      });
    }
    return elements;
  }
  addMinElements() {
    var elements = [];
    for (let index = 0; index < this.minElementsSize; index++) {
      var children = this.createChildrenChunk();
      children.forEach(child => {
        elements.push(child.getJsx());
      });
    }
    return elements;
  }

  addElements() {
    //  this.renderComponents();
    if (this.maxElementsSize > this.elementAddCount + this.minElementsSize) {
      var children = this.createChildrenChunk();
      this.props.page.addElements(
        1 + this.elementAddCount * this.elementChunkCount,
        children,
        this.props.ids.fieldGroupId
      );
      this.elementAddCount++;
      this.setElementAddCountState(this.elementAddCount);
    }
  }

  deleteElements() {
    if (this.elementAddCount > 0) {
      this.props.page.deleteElements(
        1 + this.elementChunkCount * (this.elementAddCount - 1),
        this.elementChunkCount,
        this.props.ids.fieldGroupId
      );
      this.elementAddCount--;
      this.setElementAddCountState(this.elementAddCount);
    }
  }

  /**
   * Preserve the element add count so we can restore its state between the wizard navigation
   */
  setElementAddCountState(count) {
    this.props.fieldDef.elementAddCount = count;
  }

  addObject = event => {
    const fieldNumber = document
      .getElementById(event.target.id)
      .getAttribute("fieldnumber");

    const parentFieldNumber = document
      .getElementById(event.target.id)
      .getAttribute("parentfieldnumber");

    const grandParentFieldNumber = document
      .getElementById(event.target.id)
      .getAttribute("grandparentfieldnumber");

    let field;
    if (grandParentFieldNumber != -1 && parentFieldNumber != -1) {
      field = this.props.page.props.pageDef.fields[grandParentFieldNumber]
        .fields[parentFieldNumber].fields[fieldNumber];
    } else if (parentFieldNumber != -1) {
      field = this.props.page.props.pageDef.fields[parentFieldNumber].fields[
        fieldNumber
      ];
    } else {
      field = this.props.page.props.pageDef.fields[fieldNumber];
    }

    let combinedFieldNumber = parentFieldNumber + "_" + fieldNumber;
    if (grandParentFieldNumber != -1) {
      combinedFieldNumber = grandParentFieldNumber + "_" + combinedFieldNumber;
    }
    const sampleObj = this.retrieveObjectMap(combinedFieldNumber);

    if (field.min < field.max) {
      for (var i = 0; i < sampleObj.length; i++) {
        console.log(sampleObj[i].jsonPath);
        var res = "";
        if (field.jsonPath.length < sampleObj[i].jsonPath.length) {
          res = sampleObj[i].jsonPath.substring(
            field.jsonPath.length,
            sampleObj[i].jsonPath.length
          );
          res = field.jsonPath.concat(res);
          //  console.log(">>>>>>>>>>>>>" + element.props.fieldDef.id);
          sampleObj[i].jsonPath = res.replace(/\*/g, field.min);
        } else {
          sampleObj[i].jsonPath = sampleObj[i].jsonPath.replace(
            /\*/g,
            field.min
          );
        }
      }
      field.fields = field.fields.concat(sampleObj);

      let fields = this.props.page.props.pageDef.fields;
      if (grandParentFieldNumber != -1) {
        fields = fields[parseInt(grandParentFieldNumber)].fields;
      }
      if (parentFieldNumber != -1) {
        fields = fields[parseInt(parentFieldNumber)].fields;
      }
      fields[fieldNumber].fields.concat(sampleObj);

      field.min = field.min + 1;
      this.props.page.loadPageChildren();
    } else {
      console.log("addOneFieldForObj, min = max, can't add more!");
    }
  };

  deleteObject = event => {
    const fieldNumber = document
      .getElementById(event.target.id)
      .getAttribute("fieldnumber");

    const parentFieldNumber = document
      .getElementById(event.target.id)
      .getAttribute("parentfieldnumber");

    const grandParentFieldNumber = document
      .getElementById(event.target.id)
      .getAttribute("grandparentfieldnumber");

    let field;
    if (grandParentFieldNumber != -1 && parentFieldNumber != -1) {
      field = this.props.page.props.pageDef.fields[grandParentFieldNumber]
        .fields[parentFieldNumber].fields[fieldNumber];
    } else if (parentFieldNumber != -1) {
      field = this.props.page.props.pageDef.fields[parentFieldNumber].fields[
        fieldNumber
      ];
    } else {
      field = this.props.page.props.pageDef.fields[fieldNumber];
    }

    let combinedFieldNumber = parentFieldNumber + "_" + fieldNumber;
    if (grandParentFieldNumber != -1) {
      combinedFieldNumber = grandParentFieldNumber + "_" + combinedFieldNumber;
    }
    const sampleObj = this.retrieveObjectMap(combinedFieldNumber);

    if (field.min > 0) {
      for (var i = 0; i < sampleObj.length; i++) {
        field.fields.pop();
        let poppedFieldNumber = sampleObj.length - i - 1;
        this.removeObjectMapPrefix(fieldNumber, poppedFieldNumber);
      }

      field.min = field.min - 1;
      this.props.page.loadPageChildren();
    } else {
      console.log("deleteOneFieldForObj, min = 0, can't delete more!");
    }
  };
}

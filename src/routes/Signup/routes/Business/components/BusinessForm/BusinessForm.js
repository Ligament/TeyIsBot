import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Grid, MenuItem } from "@material-ui/core";
import TextField from "components/FormTextField";
import { required } from "utils/form";
import styles from "./BusinessForm.styles";
import SelectField from "components/FormSelectField";
import { useFirebaseConnect, isLoaded, isEmpty } from "react-redux-firebase";
import { useSelector } from "react-redux";
import ImageUploadField from "components/FormImageUploadField";

const useStyles = makeStyles(styles);
const positionMap = [
  { name: "เจ้าของ", role: "owner" },
  { name: "พ่อครัว", role: "chef" },
  { name: "พนักงานเก็บเงิน", role: "cashier" },
  { name: "พนักงานเสิร์ฟ", role: "waiter" },
  { name: "พนักงานส่ง", role: "rider" },
];

function BusinessForm({ pristine, submitting, handleSubmit, positionValue }) {
  const classes = useStyles();
  useFirebaseConnect([
    'restaurants'
  ])
  const restaurantsData = useSelector(state => state.firebase.ordered.restaurants)
   
  var restaurants = [{name: "", label: "..."}]
  if (isLoaded(restaurantsData)&& !isEmpty(restaurantsData)) {
    restaurants = restaurantsData.map((rs) => rs.key !== 'staff' && ({name: rs.value.name, label: rs.value.nameTH}))
  }
  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item>
          <Field
            name="firstName"
            autoComplete="firstName"
            component={TextField}
            label="ชื่อ"
            variant="outlined"
            validate={required}
          />
        </Grid>
        <Grid item>
          <Field
            name="lastName"
            autoComplete="lastName"
            component={TextField}
            label="นามสกุล"
            variant="outlined"
            validate={required}
          />
        </Grid>
        <Grid item>
          <Field
            name="phoneNumber"
            autoComplete="phoneNumber"
            component={TextField}
            label="เบอร์โทรศัพท์"
            variant="outlined"
            validate={required}
            type="number"
          />
        </Grid>
        <Grid item>
          <Field
            name="position"
            component={SelectField}
            autoComplete="position"
            label="ตำแหน่ง"
            classes={classes}
            variant="outlined"
            validate={required}
            children={positionMap.map((position, key) => (
              <MenuItem key={key + position.role} value={position.role}>
                {position.name}
              </MenuItem>
            ))}
          />
        </Grid>
        {positionValue === "owner" ? (
          <Fragment>
            <Grid item>
              <Field
                name="restaurantNameTH"
                autoComplete="restaurantName"
                component={TextField}
                label="ชื่อร้าน"
                placeholder="ภาษาไทย"
                variant="outlined"
                validate={required}
              />
            </Grid>
            <Grid item>
              <Field
                name="restaurantNameEN"
                autoComplete="restaurantName"
                component={TextField}
                label="ชื่อร้าน"
                placeholder="ภาษาอังกฤษ"
                variant="outlined"
                validate={required}
              />
            </Grid>
            <Grid item>
            <Field
                name="pictureUrl"
                component={ImageUploadField}
                path="images/restaurants"
                dbPath="images/restaurants"
                label="Food Picture URL"
                validate={[required]}
                style={{ width: 202 }}
              />
            </Grid>
          </Fragment>
        ) : (
          <Field
            name="restaurantNameEN"
            component={SelectField}
            autoComplete="restaurantName"
            label="ชื่อร้าน"
            classes={classes}
            variant="outlined"
            validate={required}
            children={restaurants.map((rs, key) => (
              <MenuItem key={key + rs.name} value={rs.name}>
                {rs.label}
              </MenuItem>
            ))}
          />
        )}
        <Grid item>
          <Button
            color="primary"
            type="submit"
            variant="contained"
            disabled={pristine || submitting}
            size="large"
          >
            {submitting ? "Loading" : "ลงทะเบียน"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

BusinessForm.propTypes = {
  pristine: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  submitting: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  handleSubmit: PropTypes.func.isRequired, // from enhancer (reduxForm - calls onSubmit)
};

export default BusinessForm;

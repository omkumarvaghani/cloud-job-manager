import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import InputText from "../InputFields/InputText";
import "./style.css";

const DiscountTable = ({
  subTotal,
  discountAmount,
  taxAmount,
  Total,
  formik,
}) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showTax, setShowTax] = useState(false);
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell
            className="text-blue-color fw-medium"
            style={{ height: "50px", fontSize: "16px" }}
          >
            Subtotal
          </TableCell>
          <TableCell
            className="text-end text-blue-color fw-medium"
            style={{ fontSize: "16px" }}
          >
            {`$${
              new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(subTotal ?? 0) || ""
            }`}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell
            className="text-blue-color fw-medium"
            style={{ height: "50px", fontSize: "16px" }}
          >
            Discount
          </TableCell>
          <TableCell
            className={`d-flex discountTableBox ${
              !showDiscount
                ? "justify-content-end"
                : "justify-content-between" || ""
            }`}
            style={{ fontSize: "16px" }}
          >
            {showDiscount && (
              <Typography
                className="discountInputBox"
                style={{ position: "relative", display: "inline-block" }}
              >
                <InputText
                  id="Discount"
                  name="Discount"
                  placeholder="0.00"
                  className="text-blue-color"
                  style={{
                    fontSize: "14px",
                    paddingLeft: "15px",
                  }}
                  type="text"
                  value={formik?.values?.Discount}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                      if (value === "" || parseFloat(value) <= 100) {
                        formik.setFieldValue("Discount", value);
                      } else {
                        formik.setFieldValue("Discount", "100");
                      }
                    }
                  }}
                  onBlur={formik?.handleBlur}
                />

                <Typography
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                  className="text-blue-color"
                >
                  %
                </Typography>
              </Typography>
            )}
            <Typography
              className="text-blue-color underline-u"
              style={{
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "end",
                marginBottom: "9px",
                fontSize: "16px",
              }}
              onClick={() => setShowDiscount(!showDiscount)}
            >
              {discountAmount > 0
                ? `$${discountAmount?.toFixed(2)}`
                : "Add Discount"}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            className="text-blue-color fw-medium"
            style={{ height: "50px", fontSize: "16px" }}
          >
            Tax
          </TableCell>
          <TableCell
            className={`d-flex discountTableBox   ${
              !showTax ? "justify-content-end" : "justify-content-between"
            }`}
            style={{ fontSize: "16px" }}
          >
            {showTax && (
              <Typography
                style={{ position: "relative", display: "inline-block" }}
                className="discountInputBox"
              >
                <InputText
                  id="Tax"
                  name="Tax"
                  type="text"
                  placeholder="0.00"
                  className="text-blue-color"
                  style={{ fontSize: "16px", paddingLeft: "15px" }}
                  value={formik?.values?.Tax}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                      if (value === "" || parseFloat(value) <= 100) {
                        formik.setFieldValue("Tax", value);
                      } else {
                        formik.setFieldValue("Tax", "100");
                      }
                    }
                  }}
                  onBlur={formik?.handleBlur}
                />

                <Typography
                  className="text-blue-color"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  %
                </Typography>
              </Typography>
            )}
            <Typography
              className="text-blue-color underline-u discountInputBox"
              style={{
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "9px",
                fontSize: "16px",
              }}
              onClick={() => setShowTax(!showTax)}
            >
              {taxAmount > 0 ? `$${taxAmount?.toFixed(2)}` : "Add Tax"}
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow className="last-row border-0">
          <TableCell
            className="border-0 text-blue-color"
            style={{ fontSize: "16px" }}
          >
            <b>Total</b>
          </TableCell>
          <TableCell
            className="text-end border-0 text-blue-color"
            style={{ fontSize: "16px" }}
          >
            <b>{`$${new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Total ?? 0)}`}</b>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default DiscountTable;

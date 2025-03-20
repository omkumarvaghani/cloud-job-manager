import React, { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import "./TemplateEditor.css";
import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { Info } from "@mui/icons-material";

const TemplateEditor = ({
  data,
  setData,
  type = "Manual Customer",
  isToolTip = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef(null);
  const LICENSE_KEY = "GPL";

  const tipsObject = {
    "Reset Password": [
      { "${Url}": "Reset password link" },
      { "${EmailAddress}": "E-mail Address" },
    ],
    Invitation: [
      { "${FirstName}": "Receiver FirstName Name" },
      { "${LastName}": "Receiver LastName Name" },
      { "${EmailAddress}": "Receiver Email Address" },
      { "${PhoneNumber}": "Receiver Phone Number" },
      { "${companyName}": "Company Name" },
      { "${EmailAddress}": "Company E-mail Address" },
      { "${companyPhoneNumber}": "Company Phone Number" },
      { "${Url}": "Set Password Link" },
    ],
    Quote: [
      { "${FirstName}": "Receiver FirstName Name" },
      { "${LastName}": "Receiver LastName Name" },
      { "${EmailAddress}": "Receiver Email Address" },
      { "${PhoneNumber}": "Receiver Phone Number" },
      { "${companyName}": "Company Name" },
      { "${EmailAddress}": "Company E-mail Address" },
      { "${companyPhoneNumber}": "Company Phone Number" },
      { "${Title}": "Quote Title" },
      { "${QuoteNumber}": "Quote Number" },
      { "${SubTotal}": "Quote Sub Total" },
      { "${Discount}": "Quote Discount" },
      { "${Tax}": "Quote Tax" },
      { "${Total}": "Quote Total" },
    ],
    Contract: [
      { "${FirstName}": "Receiver FirstName Name" },
      { "${LastName}": "Receiver LastName Name" },
      { "${EmailAddress}": "Receiver Email Address" },
      { "${PhoneNumber}": "Receiver Phone Number" },
      { "${companyName}": "Company Name" },
      { "${EmailAddress}": "Company E-mail Address" },
      { "${companyPhoneNumber}": "Company Phone Number" },
      { "${Title}": "Contract Title" },
      { "${ContractNumber}": "Contract Number" },
      { "${SubTotal}": "Contract Sub Total" },
      { "${Discount}": "Contract Discount" },
      { "${Tax}": "Contract Tax" },
      { "${Total}": "Contract Total" },
    ],
    Invoice: [
      { "${FirstName}": "Receiver FirstName Name" },
      { "${LastName}": "Receiver LastName Name" },
      { "${EmailAddress}": "Receiver Email Address" },
      { "${PhoneNumber}": "Receiver Phone Number" },
      { "${companyName}": "Company Name" },
      { "${EmailAddress}": "Company E-mail Address" },
      { "${companyPhoneNumber}": "Company Phone Number" },
      { "${Subject}": "Invoice Title" },
      { "${InvoiceNumber}": "Invoice Number" },
      { "${SubTotal}": "Invoice Sub Total" },
      { "${Discount}": "Invoice Discount" },
      { "${Tax}": "Invoice Tax" },
      { "${Total}": "Invoice Total" },
    ],
    "Invoice Payment": [
      { "${FirstName}": "Receiver FirstName Name" },
      { "${LastName}": "Receiver LastName Name" },
      { "${EmailAddress}": "Receiver Email Address" },
      { "${PhoneNumber}": "Receiver Phone Number" },
      { "${companyName}": "Company Name" },
      { "${EmailAddress}": "Company E-mail Address" },
      { "${companyPhoneNumber}": "Company Phone Number" },
      { "${Total}": "Total Amount" },
      { "${Amount}": "Paid Amount" },
      { "${Method}": "Paid Method" },
      { "${MakePayment}": "Make Payemnt" },
    ],
    "Recurring Payment": [
      { "${FirstName}": "Receiver FirstName Name" },
      { "${LastName}": "Receiver LastName Name" },
      { "${EmailAddress}": "Receiver Email Address" },
      { "${PhoneNumber}": "Receiver Phone Number" },
      { "${companyName}": "Company Name" },
      { "${EmailAddress}": "Company E-mail Address" },
      { "${companyPhoneNumber}": "Company Phone Number" },
      { "${Amount}": "Paid Amount" },
      { "${Method}": "Paid Method" },
    ],
  };

  const ToolTips = () => {
    if (type) {
      const tips = tipsObject[type];
      if (tips && tips.lenght === 0) return null;

      return (
        <ul>
          {tips.map((tip, index) => {
            const [variable, description] = Object.entries(tip)[0];
            return (
              <li key={index}>
                {variable} - {description}
              </li>
            );
          })}
        </ul>
      );
    } else {
      return null;
    }
  };

  const handleSelectVariable = (variable, editor) => {
    const content = editor.getData();
    const olElement = document.createElement("div");
    olElement.innerHTML = content;

    const newData =
      content.slice(0, content.lastIndexOf("<")) +
      variable.split("$")[1] +
      content.slice(content.lastIndexOf("<"), content.lenght);

    setData(newData);
    setDropdownOpen(false);
  };

  const handleEditorChange = (event, editor) => {
    const content = editor.getData();
    setData(content);

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const olElement = document.createElement("div");
    olElement.innerHTML = content;
    const lastChar = olElement.textContent.slice(-1);

    if (lastChar === "$") {
      const editorContainer = document.querySelector(".ck-content");
      const editorRect = editorContainer.getBoundingClientRect();

      setDropdownPosition({
        top: rect.top === 0 ? editorRect.top + 30 : rect.top + 10,
        left: rect.left === 0 ? editorRect.left + 30 : rect.left + 10,
      });
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <div className="editor-wrapper">
        <div className="d-flex justify-content-between">
          <label
            className="form-control-label fontstylerentr titleecolor fontfamilysty"
            htmlFor="editor"
            style={{
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            Body
          </label>

          {isToolTip && (
            <Tooltip
              title={
                <Box style={{ fontSize: "14px" }}>
                  You can personalize transaction templates using the following
                  dynamic variables:
                  <ToolTips />
                </Box>
              }
              placement="bottom"
              arrow
            >
              <IconButton>
                <Info />
              </IconButton>
            </Tooltip>
          )}
        </div>

        <div id="editor-toolbar"></div>

        <div id="editor-container" className="editor-container">
          <CKEditor
            editor={DecoupledEditor}
            data={data}
            onChange={handleEditorChange}
            onReady={(editor) => {
              editorRef.current = editor;
              const toolbarContainer =
                document.querySelector("#editor-toolbar");
              toolbarContainer.appendChild(editor.ui.view.toolbar.element);
            }}
            config={{
              toolbar: {
                items: [
                  "undo",
                  "redo",
                  "|",
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "|",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "|",
                  "insertTable",
                  "blockQuote",
                  "|",
                  "trackChanges",
                  "comment",
                  "|",
                  "alignment",
                  "|",
                  "fontSize",
                  "fontColor",
                  "fontBackgroundColor",
                ],
              },
              licenseKey: LICENSE_KEY,

              fontSize: {
                options: ["tiny", "small", "default", "big", "huge"],
              },
              fontFamily: {
                options: [
                  "default",
                  "Arial",
                  "Courier New",
                  "Georgia",
                  "Times New Roman",
                  "Verdana",
                ],
              },
              font: {
                options: ["default", "Arial", "Times New Roman"],
              },
              styles: {
                "p, h1, h2, h3, h4, h5, h6, body": {
                  "line-height": 0.5,
                },
              },
            }}
          />

          {dropdownOpen && (
            <Menu
              open={dropdownOpen}
              anchorReference="anchorPosition"
              anchorPosition={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
              onClose={() => setDropdownOpen(false)}
            >
              {tipsObject[type]?.map((tip, index) => {
                const [variable] = Object.keys(tip);
                return (
                  <MenuItem
                    key={index}
                    onClick={() =>
                      handleSelectVariable(variable, editorRef.current)
                    }
                  >
                    {variable}
                  </MenuItem>
                );
              })}
            </Menu>
          )}
        </div>
      </div>
    </>
  );
};

export default TemplateEditor;

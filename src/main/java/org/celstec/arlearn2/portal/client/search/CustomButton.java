package org.celstec.arlearn2.portal.client.search;

import com.google.gwt.user.client.DOM;
import com.google.gwt.user.client.Element;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.Image;

public class CustomButton extends Button {
	private String text;

	public CustomButton() {
		super();
	}

	public void setResource(String imageResource) {
		Image img = new Image(imageResource);
		String definedStyles = img.getElement().getAttribute("style");
		img.getElement().setAttribute("style",
				definedStyles + "; vertical-align:middle;");
		DOM.insertBefore(getElement(), img.getElement(),
				DOM.getFirstChild(getElement()));
	}

	@Override
	public void setText(String text) {
		this.text = text;
		Element span = DOM.createElement("span");
		span.setInnerText(text);
		span.setAttribute("style", "padding-left:3px; vertical-align:middle;");

		DOM.insertChild(getElement(), span, 0);
	}

	@Override
	public String getText() {
		return this.text;
	}
}
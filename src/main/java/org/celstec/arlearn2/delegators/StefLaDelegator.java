package org.celstec.arlearn2.delegators;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.logging.Logger;

/**
 * ****************************************************************************
 * Copyright (C) 2017 Open Universiteit Nederland
 * <p/>
 * This library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <p/>
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * <p/>
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library.  If not, see <http://www.gnu.org/licenses/>.
 * <p/>
 * Contributors: Angel Suarez
 * Date: 09/10/17
 * ****************************************************************************
 */

public class StefLaDelegator extends GoogleDelegator{
    protected static final Logger logger = Logger.getLogger(StefLaDelegator.class.getName());

    protected String host = "xapi-proxy.appspot.com";
    protected String baseUrl = "/data-proxy/xAPI/statement/origin/DojoIBL";
    protected String basicToken = "ZG9qbzppYmw=";

    private static StefLaDelegator learningLockerDelegator;

    public StefLaDelegator() {
        super();
    }

    public void registerStatement(String actor, String verb, String object) {
        //TODO validations
//        submitStatment(actor,verb,object);
    }

    public void registerStatement(String jsonLaStatement) {
        //TODO validations
        submitStatement(jsonLaStatement);
    }

    private void submitStatement(String jsonStatement) {
        try {
            URL url = new URL("http://"+host+baseUrl);

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setRequestProperty("Authorization", "Basic " + this.basicToken);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("X-Experience-API-Version", "1.0.1");
            connection.setRequestProperty("Postman-Token", "4faf2485-b1c9-e162-cec4-37b5d82fd78c");
            connection.setRequestMethod("POST");
            connection.setUseCaches(false);
            connection.setDoInput(true);
            connection.setDoOutput(true);

            OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());
            writer.write(new JSONObject(jsonStatement).toString());
            writer.close();
            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                System.out.println("ok");

            } else {
                System.out.println("nok" + connection.getResponseCode());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public JSONObject createJSON(String actor, String verb, String object) throws JSONException {
        JSONObject jsonresult = new JSONObject();
        JSONObject menuActor = new JSONObject();
        jsonresult.put("actor", menuActor);
        menuActor.put("mbox", "mailto:"+actor);

        JSONObject menuVerb = new JSONObject();
        jsonresult.put("verb", menuVerb);
        menuVerb.put("id", "http://dojo-ibl.appspot.com/"+verb);

        JSONObject menuObject = new JSONObject();
        jsonresult.put("object", menuObject);
        menuObject.put("id", object);

        return jsonresult;
    }
}
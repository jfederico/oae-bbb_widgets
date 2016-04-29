/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

casper.test.begin('Widget - Edit meeting', function(test) {

    /**
     * Verify that the editMeeting button can be pressed and press it
     */
    var openEditMeeting = function() {
        casper.waitForSelector('#meeting-clip-container .oae-clip-content > button', function() {
            casper.click('#meeting-clip-container .oae-clip-content > button');
            casper.waitForSelector('button.oae-trigger-editmeeting', function() {
                test.assertVisible('button.oae-trigger-editmeeting', 'Edit meeting trigger exists');
                casper.click('button.oae-trigger-editmeeting');
                casper.waitUntilVisible('#editmeeting-modal', function() {
                    test.assertVisible('#editmeeting-modal', 'Edit meeting pane is showing after trigger');
                    casper.click('#meeting-clip-container .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Verify that the editmeeting form is present
     */
    var verifyEditMeetingFormElements = function() {
        casper.waitForSelector('#editmeeting-modal', function() {
            test.assertExists('form#editmeeting-form','The edit meeting form is present');
            test.assertExists('form#editmeeting-form #editmeeting-name','The edit meeting name field is present');
            test.assertExists('form#editmeeting-form #editmeeting-description','The edit meeting description field is present');
            test.assertExists('form#editmeeting-form button[type="submit"]','The edit meeting form submit button is present');
        });
    };

    /**
     * Verify that the following forms give an error:
     *  - Form without name and description
     *  - Form without description
     *  - Form without name
     */
    var verifyEditMeetingFormValidate = function() {
        // Form without name and description
        casper.fill('form#editmeeting-form', {
            'editmeeting-name': '',
            'editmeeting-description': ''
        }, false);
        casper.click('#editmeeting-form button[type="submit"]');
        test.assertVisible('#editmeeting-name-error', 'Verify validating empty form, name-error is visible');
        test.assertVisible('#editmeeting-description-error', 'Verify validating empty form, description-error is visible');

        // Form without description
        casper.fill('form#editmeeting-form', {
            'editmeeting-name': 'Test',
            'editmeeting-description': ''
        }, false);
        casper.click('#editmeeting-form button[type="submit"]');
        test.assertNotVisible('#editmeeting-name-error', 'Verify validating empty description, name-error is not visible');
        test.assertVisible('#editmeeting-description-error', 'Verify validating empty description, description-error is visible');

        // Form without name
        casper.fill('form#editmeeting-form', {
            'editmeeting-name': '',
            'editmeeting-description': 'Test'
        }, false);
        casper.click('#editmeeting-form button[type="submit"]');
        test.assertVisible('#editmeeting-name-error', 'Verify validating empty name, name-error is visible');
        test.assertNotVisible('#editmeeting-description-error', 'Verify validating empty name, description-error is not visible');
    };

    /**
     * Verify that a meeting can be edited
     */
    var verifyEditMeeting = function() {
        // Fill the form
        casper.fill('form#editmeeting-form', {
            'editmeeting-name': 'New meeting name',
            'editmeeting-description': 'New meeting description'
        }, false);
        // Submit the editmeeting form
        casper.click('#editmeeting-form button[type="submit"]');
        // Verify that the changes have been persisted
        casper.waitForSelector('#oae-notification-container .alert', function() {
            test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'The meeting details were successfully saved');
            test.assertSelectorHasText('#meeting-clip-container h1', 'New meeting name', 'The meeting name was successfully renamed to \'New meeting name\'');
            test.assertSelectorHasText('#meeting-description', 'New meeting description', 'The meeting description was successfully changed to \'New meeting description\'');
        });
    };

    casper.start(configUtil.tenantUI, function(){
        // Create a user to test with
        userUtil.createUsers(1, function(user1) {
            // Log in with that user
            userUtil.doLogIn(user1.username, user1.password);

            // Create a meeting
            meetingUtil.createMeeting(null, null, null, null, null, function(err, meetingProfile) {

                uiUtil.openMeetingProfile(meetingProfile);

                // Verify that editmeetings can be triggered
                casper.then(function() {
                    casper.echo('# Verify editmeeting modal','INFO');
                    openEditMeeting();
                });

                // Verify that the edit meeting form is opened and visible
                casper.then(function() {
                    casper.echo('# Verify editmeeting form elements','INFO');
                    verifyEditMeetingFormElements();
                });

                // Verify that the errors from the edit form works
                casper.then(function() {
                    casper.echo('# Verify editmeeting form validation','INFO');
                    verifyEditMeetingFormValidate();
                });

                // Verify that the details can be edited
                casper.then(function() {
                    casper.echo('# Verify meeting can be edited','INFO');
                    verifyEditMeeting();
                });

                // Log out again
                userUtil.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});

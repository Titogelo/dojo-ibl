package org.celstec.arlearn2.delegators;

import org.celstec.arlearn2.api.Service;
import org.celstec.arlearn2.beans.run.Message;
import org.celstec.arlearn2.beans.run.MessageList;
import org.celstec.arlearn2.beans.run.RunAccess;
import org.celstec.arlearn2.jdo.manager.MessageManager;
import org.celstec.arlearn2.jdo.manager.ThreadManager;

import java.util.logging.Logger;

public class MessageDelegator extends GoogleDelegator {
    private static final Logger logger = Logger.getLogger(MessageDelegator.class.getName());
    private static final long MILLIS_PER_DAY =  1 * 5 * 60 * 1000L; // 1 minute

    public MessageDelegator(Service service) {
        super(service);
    }


    public Message sendMessage(Message message, String userId) {
        new NotificationDelegator(this).broadcast(message, account.getFullId());
        return message;
    }

    public Message createMessage(Message message) {
        message.setDate(System.currentTimeMillis());
        if ((message.getThreadId() == null || message.getThreadId() ==0l) && message.getRunId()!= null) {
            message.setThreadId(new ThreadDelegator(this).getDefaultThread(message.getRunId()).getThreadId());
        }
        Message returnMessage = MessageManager.createMessage(message);

        /*
        * Angel
        *
        * Added task which starts a timer of 1 minutes.
        * If five minutes have passed after the last message the task will send and email
        * to all the account that participate in the inquiry that did not login in the
        * last 1 minutes.
        * */

//        Queue q = QueueFactory.getDefaultQueue();
////        Queue q = QueueFactory.getQueue(String.valueOf(message.getRunId()));
//        q.purge();
//
////        q.deleteTask(String.valueOf(message.getRunId()));
//
//
//
//        q.add(TaskOptions.Builder.withUrl("/setTimerEmailNotification").countdownMillis(MILLIS_PER_DAY)
//                .param("token", this.getAuthToken())
//                .param("name", String.valueOf(message.getRunId())));

        RunAccessDelegator rad = new RunAccessDelegator(this);
        NotificationDelegator nd = new NotificationDelegator(this);
        for (RunAccess ra : rad.getRunAccess(message.getRunId()).getRunAccess()) {

            /*
            * 1) new message is created
            * 2) create a task, which sends an email after 2 hours
            * 3) send the email only for users that did not login in the last two hours
            * */

            nd.broadcast(returnMessage, ra.getAccount());
        }

//        (new NotifyUsersForMessage(authToken, returnMessage)).scheduleTask();

        return returnMessage;
    }

    public Message getMessagesById(long messageIdentifier) {
        return MessageManager.getMessage(messageIdentifier);
    }


    public MessageList getMessagesForThread(long threadId) {
        return MessageManager.getMessagesByThreadId(threadId);
    }

    public MessageList getMessagesForThread(long threadId, Long from, Long until, String cursor) {
        return MessageManager.getMessagesByThreadId(threadId, from, until, cursor);
    }


    public MessageList getMessagesForDefaultThread(Long runId) {
        org.celstec.arlearn2.beans.run.Thread thread = ThreadManager.getDefaultThread(runId);
        if (thread == null) thread = new ThreadDelegator(this).getDefaultThread(runId);
        if (thread != null) {
            return getMessagesForThread(thread.getThreadId());
        }
        return null;
    }

    public MessageList getMessagesForDefaultThread(Long runId, Long from, Long until, String cursor) {
        org.celstec.arlearn2.beans.run.Thread thread = ThreadManager.getDefaultThread(runId);
        if (thread == null) thread = new ThreadDelegator(this).getDefaultThread(runId);
        if (thread != null) {
            return getMessagesForThread(thread.getThreadId(), from, until, cursor);
        }
        return null;
    }

    public MessageList getRecentMessagesForDefaultThread(Long runId, int amount) {
        org.celstec.arlearn2.beans.run.Thread thread = ThreadManager.getDefaultThread(runId);
        if (thread == null) thread = new ThreadDelegator(this).getDefaultThread(runId);
        if (thread != null) {
            return MessageManager.getRecentMessagesByThreadId(thread.getThreadId(), amount);
        }
        return null;
    }

}

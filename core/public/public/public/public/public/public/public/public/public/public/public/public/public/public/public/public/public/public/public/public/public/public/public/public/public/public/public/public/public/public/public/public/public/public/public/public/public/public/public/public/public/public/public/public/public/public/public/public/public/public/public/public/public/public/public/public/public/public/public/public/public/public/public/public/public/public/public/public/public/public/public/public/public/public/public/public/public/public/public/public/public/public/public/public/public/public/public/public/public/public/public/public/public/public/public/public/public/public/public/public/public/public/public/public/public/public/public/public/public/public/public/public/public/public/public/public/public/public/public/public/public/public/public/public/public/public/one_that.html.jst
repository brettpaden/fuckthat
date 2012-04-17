<table id="one_joke" class="one_joke">
  <% var my_joke = session_user ? joke.my_joke(session_user.id) : null %>
  <% var my_vote = joke.my_vote %>
  <% var button1 = my_vote && my_vote.get('yesno') ? 'Vote No' : 'Vote Yes' %>
  <% var value1 = my_vote ? !my_vote.get('yesno') : true %>
  <% var button2 = my_vote ? 'Withdraw' : 'Vote No' %>
  <% var value2 = my_vote !== null ? null : false %> 
  <tr>
    <td class="joke_vote">
      <% if (session_user) { %>
        <% if (my_joke) { %>
          <p class="vote_msg">Can't vote on your own joke!</p>
        <% } else { %>
          <table>
            <tr>
              <% var vote_class = my_vote && my_vote.get('yesno') ? 'yes_vote' : 'no_vote' %>
              <% var vote_text = my_vote ? my_vote.vote_text() : '' %>
              <td class="my_vote">
                <%= 'My vote: ' %><span class="<%= vote_class %>"><%= vote_text %></span>
              </td>
            </tr>
            <tr>
              <td width="200px">
                <% var vote1 = my_vote ? my_vote : new Vote() %> 
                <% var vote1_id = vote1.id %>
                <form accept-charset="UTF-8" action="/votes/<%= vote1_id %>" class="edit_vote" id="edit_vote_<%= vote1_id %>" method="post">
                  <input id="vote_joke_id" name="vote[joke_id]" type="hidden" value="<%= joke.cid %>">
                  <input id="vote_yesno" name="vote[yesno]" type="hidden" value="<%= value1 %>">
                  <input class="vote_button" name="commit" type="submit" value="<%= button1 %>">
                </form>
              </td>
            </tr>
            <tr>
              <td width="200px">
                <% var vote2 = my_vote != null ? my_vote : new Vote() %> 
                <% var vote2_id = vote2.id %>
                <% var method2 = my_vote ? ":delete" : ":post" %>
                <form accept-charset="UTF-8" action="/votes'<%= vote2_id %>" class="edit_vote" id="edit_vote_<%= vote2_id %>" method="<%= method2 %>">
                  <input id="vote_joke_id" name="vote[joke_id]" type="hidden" value="<%= joke.cid %>">
                  <input id="vote_yesno" name="vote[yesno]" type="hidden" value="<%= value2 %>">
                  <input class="vote_button" name="commit" type="submit" value="<%= button2 %>">
                </form> 
              </td>
            </tr>
          </table>
        <% } %>
      <% } else { %>
        <p class="vote_msg">Can't vote till you login!</p>
      <% } %>
    </td>
    <td>
      <table>
        <tr>              
          <td colspan="2" align="right">
            <%= "YES: "%><span class="yes_vote"><%= joke.get('yes_votes') %></span>&nbsp;&nbsp;&nbsp;&nbsp;
            <%= "NO: " %><span class="no_vote"><%= joke.get('no_votes') %></span>&nbsp;
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <form accept-charset="UTF-8" action="/jokes/<%= joke.id %>" class="edit_joke" id="edit_joke_<%= joke.cid %>" method="post">
              <textarea class="joke" cols="72" rows="5" id="joke_content" name="joke[content]" readonly="readonly"><%= joke.get('content') %></textarea>
            </form>
          </td>
        </tr>
        <tr>
          <td id="remove_joke_<%= joke.cid %>" class="remove_joke">
            <% if (my_joke) { %>
              <a href="/jokes/<%= joke.cid %>" class="normal_link">Remove</a>
            <% } %>
          </td>
          <td align="right">
            <%= "By: " %><strong><%= my_joke ? "ME" : joke.user.get('name').capitalize() %></strong>&nbsp;(<%= (new Date(Date.parse(joke.get('when_submitted')))).std_format()%>)&nbsp;
          </td>
        </tr>
      </table>
    </td> 
  </tr>
</table>


// ---- Define your dialogs  and panels here ----
select_perms_dialog = define_new_dialog("spd", "Select Permissions");
$("#user_select_ok_button").click(function() {
    let selectedUsername = $("#user_select_list").attr("selected_item");

    $("#spd").html(`${selectedUsername} successfully added. Please add permissions for this user.`);
    $("#spd").dialog("open");
});

var new_permissions = define_new_effective_permissions(id_prefix="newpermissions1", add_info_col = true);
$('#sidepanel').append(new_permissions)

//$('#newpermissions1').attr('filepath', '/C/presentation_documents/important_file.txt')
var file_select_field = define_new_file_select_field(id_prefix="file_select_field", select_button_text="file", on_user_change=function(selected_file){$('#newpermissions1').attr('filepath', selected_file)});
$('#sidepanel').append(file_select_field);

var user_select_field = define_new_user_select_field(id_prefix='user_select_field', select_button_text='user', on_user_change = function(selected_user){$('#newpermissions1').attr('username', selected_user)})
$('#sidepanel').append(user_select_field)

$('#sidepanel').append("To view a user's permissions for a specific file, select a file and a user.")

var new_dialog = define_new_dialog(id_prefix="newdialog", title="Info");
$('.perm_info').click(function(){
    console.log('clicked!')
    new_dialog.dialog('open')
    var my_filename_var = $('#newpermissions1').attr('filepath')
    var my_user_var = $('#newpermissions1').attr('username')
    var permission_to_check = $(this).attr('permission_name');

    my_file_obj_var = path_to_file[my_filename_var]
    my_user_obj_var = all_users[my_user_var]
    var explanation1 = allow_user_action(file = my_file_obj_var, user=my_user_var, permission_to_check, explain_why = true)
    var explain_text = get_explanation_text(explanation1)
    
    new_dialog.empty()
    new_dialog.append(explain_text)
})
// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    Edit Permissions
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                Edit Permissions
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 
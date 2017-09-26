"""
Inspector page, used for viewing objects in the database.
"""


class Tab:
    """
    Base class of tabs, including the menu link and the displayed tab itself.
    """
    Name = ""
    """Friendly name to be displayed in the menu."""
    Data_tab = ""
    """Tab identifier, used as html attribute 'data-tab'."""
    Active = False
    """True if this Tab should be displayed on startup."""

    def __init__(self):
        self._menu_attrs = {"data-tab": self.Data_tab}
        self._tab_attrs = {"data-tab": self.Data_tab}
        self._menu = "a.item"
        self._tab = "div.ui.bottom.attached.tab.segment"

        if self.Active:
            self._menu += ".active"
            self._tab += ".active"

    def menu_item(self):
        """
        Returns a vnode <a> item, for use in the tab menu.
        """
        return m(self._menu, self._menu_attrs, self.Name)

    def tab_item(self):
        """
        Returns a vnode tab wrapper around the contents of the tab itself.
        """
        return m(self._tab, self._tab_attrs, self.main_view())

    def main_view(self):
        """
        Returns the vnode of the actual tab contents.
        """
        return m("div", "hello " + self.Name)


class TabledTab(Tab):
    """
    Base class for tabs in the Inspector interface, using a table and "details" view.
    """
    def __init__(self):
        super().__init__()
        self.table = None
        self.setup_table()
        self.copiedDetails = ""

    def setup_table(self):
        """
        Called on startup for the purpose of creating the Table object.
        """
        self.table = Table([])

    def _copyDetails(self):
        self.copiedDetails = self.table.detailSelected

    def _clearCopy(self):
        self.copiedDetails = ""

    def main_view(self):
        return m("div",
                 # Table needs to be in a special container to handle scrolling/sticky table header
                 m("div.table-container", m(self.table.view)),
                 m("div.ui.hidden.divider"),
                 m("div.ui.two.cards", {"style": "height: 45%;"},
                   m("div.ui.card",
                     m("div.content.small-header",
                       m("div.header",
                         m("span", "Details"),
                         m("span.ui.mini.right.floated.button", {"onclick": self._copyDetails}, "Copy")
                         )
                       ),
                     m("pre.content.code-block",
                       self.table.detailSelected
                       )
                     ),
                   m("div.ui.card",
                     m("div.content.small-header",
                       m("div.header",
                         m("span", "Copied"),
                         m("span.ui.mini.right.floated.button", {"onclick": self._clearCopy}, "Clear")
                         )
                       ),
                     m("pre.content.code-block",
                       self.copiedDetails
                       )
                     )
                   )
                 )


class Field:
    """
    A field/column of a table.
    """
    Name = None
    """Friendly name to display in table header."""

    def __init__(self, name=None):
        self.name = self.Name
        if name is not None:
            self.name = name

    def format(self, string):
        """
        Formats the string to match the expected view for this field.
        """
        if len(string) > 8:
            string = string[:5] + "..."
        return string

    def view(self, data):
        """
        Returns a vnode <td> suitable for display in a table.
        """
        return m("td", {"title": data}, self.format(data))


class Table:
    """
    A table, its headers, and its data to be displayed.
    """
    def __init__(self, fields):
        self.max_size = 8
        self.fields = fields
        self.data = {}
        self.view = {
            "oninit": self._oninit,
            "view": self._view
        }
        self._selectedRow = None
        self._selectedUid = None
        self.detailSelected = ""
        self.filter = None

    def _selectRow(self, event, uid):
        """
        Deselects any previously selected row and
        selects the row specified in the event.
        """
        if uid == self._selectedUid:
            return

        self._selectedUid = uid

        if self._selectedRow is not None:
            jQuery(self._selectedRow).removeClass("active")

        self._selectedRow = event.currentTarget
        jQuery(self._selectedRow).addClass("active")

        self.detailSelected = JSON.stringify(self.data[uid], None, 2)

    def _oninit(self):
        """
        Loads any initial data.
        """
        for i in range(20):
            obj = {}
            for field in self.fields:
                obj[field.name] = "test{0} {1}".format(i, field.name)
            self.data[i] = obj

    def _view(self):
        headers = [m("th", field.name) for field in self.fields]

        # Create the rows of the table
        rows = []
        count = 0
        for key, obj in self.data.items():
            # Make sure we don't display too many items
            if count >= self.max_size:
                rows.append(m("tr", m("td", "Limited to {} results.".format(self.max_size))))
                break

            # Make sure object passes any current search filter
            if self.filter is not None:
                if not self.filter(obj):
                    continue

            # Format each cell based on the corresponding Field
            row = [field.view(obj[field.name]) for field in self.fields]

            # Needed so we can pass through the key as-is to the lambda, without it changing through the loop
            def makeScope(uid):
                return lambda event: self._selectRow(event, uid)
            rows.append(m("tr", {"onclick": makeScope(key)}, row))

            count += 1

        if not count:
            rows.append(m("tr", m("td", "No results found.")))

        return m("table", {"class": "ui selectable celled unstackable single line left aligned table"},
                 m("thead",
                   m("tr", {"class": "center aligned"}, headers)
                   ),
                 m("tbody",
                   rows
                   )
                 )


class Entities(TabledTab):
    Name = "Entities"
    Data_tab = "entities"
    Active = True

    def setup_table(self):
        fields = [Field(x) for x in ["DID", "HID", "Signer", "Changed", "Issuants", "Data", "Keys"]]
        self.table = Table(fields)


class Issuants(TabledTab):
    Name = "Issuants"
    Data_tab = "issuants"


class Offers(TabledTab):
    Name = "Offers"
    Data_tab = "offers"


class Messages(TabledTab):
    Name = "Messages"
    Data_tab = "messages"


class AnonMsgs(TabledTab):
    Name = "Anon Msgs"
    Data_tab = "anonmsgs"


class Searcher:
    def __init__(self):
        self.searchTerm = None
        self.caseSensitive = False

    def setSearch(self, term: str):
        self.searchTerm = term
        self.caseSensitive = term.startswith('"') and term.endswith('"')
        if self.caseSensitive:
            # Remove surrounding quotes
            self.searchTerm = self.searchTerm[1:-1]
        else:
            self.searchTerm = self.searchTerm.lower()

    def _checkPrimitive(self, item):
        if isinstance(item, str):
            if not self.caseSensitive:
                item = item.lower()
            return self.searchTerm in item
        return False

    def _checkAny(self, value):
        if isinstance(value, dict):
            return self.search(value)
        elif isinstance(value, list):
            for item in value:
                if self._checkAny(item):
                    return True
            return False
        else:
            return self._checkPrimitive(value)

    def search(self, obj: dict):
        """
        Returns true if the obj recursively contains the string in a field.
        """
        for value in obj.values():
            if self._checkAny(value):
                return True
        return False


class Tabs:
    """
    Manages the displayed tabs.
    """
    def __init__(self):
        self.tabs = [Entities(), Issuants(), Offers(), Messages(), AnonMsgs()]
        self._searchId = "inspectorSearchId"
        self.searcher = Searcher()

        # Required to activate tab functionality (so clicking a menu item will activate that tab)
        jQuery(document).ready(lambda: jQuery('.menu > a.item').tab())

    def search(self):
        text = jQuery("#" + self._searchId).val()
        currentTab = jQuery(".menu a.item.active")
        data_tab = currentTab.attr("data-tab")
        self.searcher.setSearch(text)

        # Clear any previous tab's searches and apply current search to current tab
        for tab in self.tabs:
            if text and tab.Data_tab == data_tab:
                tab.table.filter = self.searcher.search
            else:
                tab.table.filter = None

    # def searchWithin(self):
    #     text = jQuery("#" + self._searchId).val()

    def view(self):
        menu_items = []
        tab_items = []
        for tab in self.tabs:
            menu_items.append(tab.menu_item())
            tab_items.append(tab.tab_item())

        return m("div",
                 m("form", {"onsubmit": self.search},
                   m("div.ui.borderless.menu",
                     m("div.right.menu", {"style": "padding-right: 40%"},
                       m("div.item", {"style": "width: 80%"},
                         m("div.ui.transparent.icon.input",
                           m("input[type=text][placeholder=Search...]", {"id": self._searchId}),
                           m("i.search.icon")
                           )
                         ),
                       m("div.item",
                         m("input.ui.primary.button[type=submit][value=Search]")
                         ),
                       # m("div.item",
                       #   m("div.ui.secondary.button", {"onclick": self.searchWithin}, "Search Within")
                       #   )
                       )
                     ),
                   ),
                 m("div.ui.top.attached.pointing.five.item.menu",
                   menu_items
                   ),
                 tab_items
                 )


tabs = Tabs()
Renderer = {
    "render": tabs.view
}

# core/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class ReactAdminPagination(PageNumberPagination):
    page_size_query_param = "perPage"

    def get_paginated_response(self, data):
        return Response(
            data,
            headers={
                "X-Total-Count": self.page.paginator.count
            }
        )
